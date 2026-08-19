"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { normalizeEmail, formatEmailError } from "@/lib/utils";

interface PermissionUpdate {
  [key: string]: boolean | undefined;
  can_read?: boolean;
  can_write?: boolean;
  can_delete?: boolean;
  can_export?: boolean;
}

/**
 * Utility to check if current user is super admin
 * Note: Actual enforcement is also on the database via RLS
 */
export async function checkSuperAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("employees")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "superadmin";
}

/**
 * Log an administrative action to the audit_logs table
 */
export async function logAction(
  supabase: SupabaseClient, 
  action: string, 
  entityType: string, 
  entityId: string, 
  payload: Record<string, unknown>
) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    actor_id: user?.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    payload
  });
}

// --- HELPERS ---

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")     // Replace spaces with -
    .replace(/[^\w-]+/g, "")   // Remove all non-word chars
    .replace(/--+/g, "-");     // Replace multiple - with single -
}

// --- TENANT ACTIONS ---

export async function createTenant(name: string, rawAdminEmail?: string, adminName?: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized: Super Admin access required" };
  }
 
  const adminEmail = rawAdminEmail ? normalizeEmail(rawAdminEmail) : undefined;

  const { data, error } = await supabase
    .from("companies")
    .insert({ 
      name,
      slug: slugify(name)
    })
    .select()
    .single();
 
  if (error) {
    if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
        return { success: false, error: "A company with this name (or a very similar one) already exists. Please use a unique name." };
    }
    return { success: false, error: error.message };
  }

  if (adminEmail) {
    const adminClient = createAdminClient();
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: "SystemCRM2026!",
      email_confirm: true,
      user_metadata: {
        company_id: data.id,
        role: "admin"
      }
    });

    if (inviteError) {
      return { success: false, error: `Tenant created but failed to create admin: ${formatEmailError(inviteError)}` };
    }

    if (inviteData?.user) {
      const { error: upsertError } = await adminClient.from("employees").upsert({
        id: inviteData.user.id,
        email_address: adminEmail,
        role: "admin",
        company_id: data.id,
        full_name: adminName || "Company Admin"
      });
      
      if (upsertError) {
          console.error("Failed to upsert employee details:", upsertError);
      }
    }
  }
 
  await logAction(supabase, "CREATE_TENANT", "company", data.id, { name, slug: data.slug });
  revalidatePath("/protected/super-admin/tenants");
  return { 
    success: true, 
    data, 
    credentials: adminEmail ? { email: adminEmail, password: "SystemCRM2026!" } : undefined 
  };
}

export async function updateTenant(id: string, name: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized" };
  }
 
  // Fetch old state for audit
  const { data: oldTenant } = await supabase.from("companies").select("name").eq("id", id).single();
 
  const { error } = await supabase
    .from("companies")
    .update({ 
      name,
      slug: slugify(name)
    })
    .eq("id", id);
 
  if (error) {
    if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
        return { success: false, error: "A company with this name (or a very similar one) already exists. Please use a unique name." };
    }
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "UPDATE_TENANT", "company", id, { 
      prev: { name: oldTenant?.name }, 
      next: { name } 
  });
  revalidatePath("/protected/super-admin/tenants");
  return { success: true };
}

export async function archiveTenant(id: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized" };
  }
 
  const { error } = await supabase
    .from("companies")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "ARCHIVE_TENANT", "company", id, {});
  revalidatePath("/protected/super-admin/tenants");
  return { success: true };
}

export async function restoreTenant(id: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized" };
  }
 
  const { error } = await supabase
    .from("companies")
    .update({ deleted_at: null })
    .eq("id", id);
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "RESTORE_TENANT", "company", id, {});
  revalidatePath("/protected/super-admin/tenants");
  return { success: true };
}

export async function purgeTenant(id: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized" };
  }
 
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id);
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "PURGE_TENANT", "company", id, {});
  revalidatePath("/protected/super-admin/tenants");
  return { success: true };
}

// --- USER ACTIONS ---

export async function updateUserRole(userId: string, role: string, companyId?: string | null) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized" };
  }
 
  // Fetch old state
  const { data: oldUser } = await supabase.from("employees").select("role, company_id").eq("id", userId).single();
 
  const dataToUpdate = { 
    role, 
    company_id: companyId || null 
  };
 
  const { error } = await supabase
    .from("employees")
    .update(dataToUpdate)
    .eq("id", userId);
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "UPDATE_USER_ROLE", "employee", userId, {
      prev: { role: oldUser?.role, company_id: oldUser?.company_id },
      next: dataToUpdate
  });
  return { success: true };
}

export async function assignLead(leadId: string, employeeId: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("leads")
    .update({ employee_id: employeeId })
    .eq("id", leadId);

  if (error) return { success: false, error: error.message };

  await logAction(supabase, "ASSIGN_LEAD", "lead", leadId, { employee_id: employeeId });
  return { success: true };
}

export async function assignAgentToProduct(agentId: string, productId: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("agent_products")
    .upsert({ agent_id: agentId, product_id: productId });

  if (error) return { success: false, error: error.message };

  await logAction(supabase, "ASSIGN_AGENT_PRODUCT", "agent_product", `${agentId}:${productId}`, { agent_id: agentId, product_id: productId });
  return { success: true };
}

export async function unassignAgentFromProduct(agentId: string, productId: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("agent_products")
    .delete()
    .match({ agent_id: agentId, product_id: productId });

  if (error) return { success: false, error: error.message };

  await logAction(supabase, "UNASSIGN_AGENT_PRODUCT", "agent_product", `${agentId}:${productId}`, { agent_id: agentId, product_id: productId });
  return { success: true };
}

export async function createAgent(data: { full_name: string, email_address: string, role: string, company_id: string | null }) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };

  const { data: employee, error } = await supabase
    .from("employees")
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await logAction(supabase, "CREATE_AGENT", "employee", employee.id, data);
  return { success: true, data: employee };
}


// --- TELEPHONY ACTIONS ---

export async function createGateway(name: string, ip: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };
 
  const { data, error } = await supabase
    .from("gateways")
    .insert({ name, ip_address: ip })
    .select()
    .single();
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "CREATE_GATEWAY", "gateway", data.id, { name, ip });
  return { success: true, data };
}

export async function updateSIMPort(id: string, phone: string, companyId: string | null) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };
 
  // Fetch old state
  const { data: oldSIM } = await supabase.from("sim_ports").select("phone_number, company_id").eq("id", id).single();
 
  const { error } = await supabase
    .from("sim_ports")
    .update({ 
        phone_number: phone, 
        company_id: companyId || null,
        updated_at: new Date().toISOString()
    })
    .eq("id", id);
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "UPDATE_SIM_PORT", "sim_port", id, {
      prev: { phone: oldSIM?.phone_number, company_id: oldSIM?.company_id },
      next: { phone, company_id: companyId }
  });
  return { success: true };
}

export async function provisionVirtualNumber(number: string, companyId: string | null, simPortId?: string | null) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };
 
  const { data, error } = await supabase
    .from("virtual_numbers")
    .insert({ 
        number, 
        company_id: companyId || null, 
        sim_port_id: simPortId || null 
    })
    .select()
    .single();
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "PROVISION_VN", "virtual_number", data.id, { number, companyId });
  return { success: true, data };
}

export async function deleteVirtualNumber(id: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("virtual_numbers")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logAction(supabase, "DELETE_VN", "virtual_number", id, {});
  return { success: true };
}

// --- PERMISSIONS ACTIONS ---

export async function updateRolePermission(role: string, module: string, permissions: PermissionUpdate) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized" };
  }
 
  const { error } = await supabase
    .from("role_permissions")
    .upsert({ 
        role, 
        module, 
        ...permissions,
        updated_at: new Date().toISOString()
    }, { onConflict: "role,module" });
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "UPDATE_PERMISSION", "role_permission", `${role}:${module}`, permissions);
  return { success: true };
}

// --- SETTINGS ACTIONS ---

export async function updateSystemSetting(key: string, value: unknown) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized" };
  }
 
  const { error } = await supabase
    .from("system_settings")
    .upsert({ 
        key, 
        value, 
        updated_at: new Date().toISOString()
    });
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "UPDATE_SETTING", "system_setting", key, { value });
  return { success: true };
}

export async function createProduct(data: { name: string, description: string }) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };

  // Generate a mock API key (usually this would be done by a database trigger or a more secure method)
  const apiKey = `pk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;

  const { data: product, error } = await supabase
    .from("products")
    .insert([{ ...data, api_key: apiKey }])
    .select("*, agent_products(agent_id, employees(full_name))")
    .single();

  if (error) return { success: false, error: error.message };

  await logAction(supabase, "CREATE_PRODUCT", "product", product.id, data);
  return { success: true, data: product };
}

export async function provisionAgent(companyId: string, name: string, rawEmail: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };
  
  const { data: profile } = await supabase.from('employees').select('role, company_id').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return { success: false, error: "Unauthorized" };
  }
  if (profile.role === 'admin' && profile.company_id !== companyId) {
      return { success: false, error: "Unauthorized to add agents for another company" };
  }

  const email = normalizeEmail(rawEmail);

  const adminClient = createAdminClient();
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.createUser({
    email,
    password: "SystemCRM2026!",
    email_confirm: true,
    user_metadata: {
      company_id: companyId,
      role: "sales_agent"
    }
  });

  if (inviteError) {
    return { success: false, error: formatEmailError(inviteError) };
  }

  if (inviteData?.user) {
    const { error: upsertError } = await adminClient.from("employees").upsert({
      id: inviteData.user.id,
      email_address: email,
      role: "sales_agent",
      company_id: companyId,
      full_name: name
    });
    if (upsertError) {
       console.error("Failed to upsert agent details:", upsertError);
    }
  }

  await logAction(supabase, "CREATE_AGENT", "employee", inviteData?.user?.id || '', { companyId, name, email });
  revalidatePath("/protected/admin");
  return { 
    success: true,
    credentials: { email, password: "SystemCRM2026!" }
  };
}

export async function adminResetUserPassword(targetUserId: string, customPassword?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: actorProfile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!actorProfile || (actorProfile.role !== "admin" && actorProfile.role !== "superadmin")) {
    return { success: false, error: "Unauthorized: Admin privileges required" };
  }

  // Fetch target user employee profile
  const { data: targetUser } = await supabase
    .from("employees")
    .select("id, email_address, role, company_id, full_name")
    .eq("id", targetUserId)
    .single();

  if (!targetUser) {
    return { success: false, error: "Target user not found" };
  }

  // RBAC Enforcement:
  // - Company Admins can ONLY reset password for workers in their own company
  // - Company Admins CANNOT reset password for Superadmins
  if (actorProfile.role === "admin") {
    if (targetUser.company_id !== actorProfile.company_id) {
      return { success: false, error: "Unauthorized: Cannot modify worker outside your organization" };
    }
    if (targetUser.role === "superadmin") {
      return { success: false, error: "Unauthorized: Cannot modify superadmin credentials" };
    }
  }

  // Generate a secure random password if customPassword is not provided
  const finalPassword = customPassword && customPassword.trim().length >= 6
    ? customPassword.trim()
    : `Pass!${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;

  const adminClient = createAdminClient();
  const { error: updateError } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: finalPassword,
  });

  if (updateError) {
    return { success: false, error: formatEmailError(updateError) };
  }

  await logAction(supabase, "ADMIN_RESET_PASSWORD", "employee", targetUserId, {
    target_email: targetUser.email_address,
    target_role: targetUser.role,
  });

  return {
    success: true,
    email: targetUser.email_address,
    fullName: targetUser.full_name,
    generatedPassword: finalPassword,
  };
}

