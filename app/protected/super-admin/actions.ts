"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from 'node:crypto';
import { revalidatePath } from "next/cache";
import { normalizeEmail, formatEmailError } from "@/lib/utils";
import { sendNotificationEmail } from "@/lib/notifications/email";

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

export async function createTenant(name: string, rawAdminEmail: string, adminName: string, plan: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized: Super Admin access required" };
  }

  // 3a. Validate and preflight
  const fieldErrors: { companyName?: string; adminName?: string; email?: string; plan?: string } = {};
  
  const cleanName = name?.trim().replace(/\s+/g, ' ');
  const cleanAdminName = adminName?.trim().replace(/\s+/g, ' ');
  const email = rawAdminEmail?.trim().toLowerCase();

  if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
    fieldErrors.companyName = "Company name must be between 2 and 100 characters.";
  }
  if (!cleanAdminName || cleanAdminName.length < 2 || cleanAdminName.length > 100) {
    fieldErrors.adminName = "Admin name must be between 2 and 100 characters.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    fieldErrors.email = "A valid email address is required.";
  }
  
  const allowedPlans = ['free', 'starter', 'pro', 'enterprise'];
  if (!plan || !allowedPlans.includes(plan)) {
    fieldErrors.plan = "Please select a valid subscription plan.";
  }

  const adminClient = createAdminClient();

  // Check email uniqueness if format is valid
  if (!fieldErrors.email) {
    const escapedEmail = email.replace(/[\\%_]/g, '\\$&');
    const { data: existingEmp } = await adminClient
      .from("employees")
      .select("id")
      .ilike("email_address", escapedEmail)
      .maybeSingle();
      
    if (existingEmp) {
      fieldErrors.email = "This email is already registered.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  // Identity decisions
  const companyId = crypto.randomUUID();
  const slug = `${slugify(cleanName)}-${companyId.substring(0, 6)}`;
  const generatedPassword = `${randomBytes(9).toString('base64url')}Aa1!`;
  
  let newAuthUserId: string | null = null;
  let companyInserted = false;

  try {
    // 3b. auth.admin.createUser first
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true
    });

    if (inviteError) {
      if (inviteError.code === 'email_exists' || /already.*registered/i.test(inviteError.message)) {
        return { success: false, fieldErrors: { email: "This email is already registered." } };
      }
      return { success: false, error: `Failed to create admin user: ${inviteError.message}` };
    }
    
    if (!inviteData?.user?.id) {
       return { success: false, error: "Failed to retrieve new admin account ID." };
    }
    newAuthUserId = inviteData.user.id;

    // 3c. insert the company with pre-generated id
    const { data: companyData, error: companyError } = await adminClient
      .from("companies")
      .insert({ 
        id: companyId,
        name: cleanName,
        slug,
        pricing_tier: plan
      })
      .select()
      .single();

    if (companyError) {
      throw companyError;
    }
    companyInserted = true;

    // 3d. upsert the employees row
    const { error: upsertError } = await adminClient.from("employees").upsert({
      id: newAuthUserId,
      email_address: email,
      role: "admin",
      company_id: companyId,
      full_name: cleanAdminName
    });
    
    if (upsertError) {
      throw new Error(`Failed to configure admin profile: ${upsertError.message}`);
    }

    // Success notifications and logs
    let emailSent = true;
    try {
      await sendNotificationEmail({
        recipientEmail: email,
        recipientName: cleanAdminName,
        eventType: "TENANT_PROVISIONED",
        subject: `Welcome to Cloudora CRM - ${cleanName}`,
        body: `Your tenant "<strong>${cleanName}</strong>" has been provisioned successfully.<br/><br/>
               <strong>Login Details:</strong><br/>
               Email: ${email}<br/>
               Password: <code>${generatedPassword}</code><br/><br/>
               Please log in and change your password immediately.`,
      });
    } catch (mailErr) {
      console.error("Failed to send notification email:", mailErr);
      emailSent = false;
    }

    try {
      await logAction(supabase, "CREATE_TENANT", "company", companyId, { name: cleanName, slug, plan });
    } catch (logErr) {
      console.error("Failed to log CREATE_TENANT action:", logErr);
    }
    
    // 3f. revalidate list and return success
    revalidatePath("/protected/super-admin/tenants");
    
    return { 
      success: true, 
      data: companyData, 
      credentials: { email, password: generatedPassword },
      emailSent
    };

  } catch (err: any) {
    // 3e. compensate in reverse order on failure
    console.error(`Provisioning failure for ${cleanName}. Rolling back. Error:`, err);
    
    if (newAuthUserId) {
      const { error: empDelErr } = await adminClient.from("employees").delete().eq("id", newAuthUserId);
      if (empDelErr) console.error(`Rollback: failed to delete employee ${newAuthUserId}`, empDelErr);
    }
    
    if (companyInserted) {
      const { error: compDelErr } = await adminClient.from("companies").delete().eq("id", companyId);
      if (compDelErr) console.error(`Rollback: failed to delete company ${companyId}`, compDelErr);
    }
    
    if (newAuthUserId) {
      const { error: authDelErr } = await adminClient.auth.admin.deleteUser(newAuthUserId);
      if (authDelErr) console.error(`Rollback: failed to delete auth user ${newAuthUserId}`, authDelErr);
    }

    if (err?.code === '23505') {
      return { success: false, fieldErrors: { companyName: "A company with this name already exists." } };
    }

    return { success: false, error: err?.message || "An unexpected error occurred during provisioning." };
  }
}

export async function updateTenant(id: string, name: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized" };
  }
 
  // Fetch old state for audit
  const { data: oldTenant } = await supabase.from("companies").select("name").eq("id", id).single();
 
  const { data, error } = await supabase
    .from("companies")
    .update({ 
      name,
      slug: slugify(name)
    })
    .eq("id", id)
    .select("id");
 
  if (error) {
    if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
        return { success: false, error: "A company with this name (or a very similar one) already exists. Please use a unique name." };
    }
    return { success: false, error: error.message };
  }
  if (!data?.length) return { success: false, error: "Not permitted or company not found" };
 
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
 
  const { data, error } = await supabase
    .from("companies")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");
 
  if (error) {
    return { success: false, error: error.message };
  }
  if (!data?.length) return { success: false, error: "Not permitted or company not found" };
 
  await logAction(supabase, "ARCHIVE_TENANT", "company", id, {});
  revalidatePath("/protected/super-admin/tenants");
  return { success: true };
}

export async function restoreTenant(id: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized" };
  }
 
  const { data, error } = await supabase
    .from("companies")
    .update({ deleted_at: null })
    .eq("id", id)
    .select("id");
 
  if (error) {
    return { success: false, error: error.message };
  }
  if (!data?.length) return { success: false, error: "Not permitted or company not found" };
 
  await logAction(supabase, "RESTORE_TENANT", "company", id, {});
  revalidatePath("/protected/super-admin/tenants");
  return { success: true };
}

export async function purgeTenant(id: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized" };
  }
 
  const { data, error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id)
    .select("id");
 
  if (error) {
    return { success: false, error: error.message };
  }
  if (!data?.length) return { success: false, error: "Not permitted or company not found" };
 
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
 
  const adminClient = createAdminClient();
 
  // Fetch old state
  const { data: oldUser } = await adminClient.from("employees").select("role, company_id").eq("id", userId).single();
 
  const dataToUpdate = { 
    role, 
    company_id: companyId || null 
  };
 
  const { data, error } = await adminClient
    .from("employees")
    .update(dataToUpdate)
    .eq("id", userId)
    .select("id");
 
  if (error) {
    return { success: false, error: error.message };
  }
  if (!data?.length) return { success: false, error: "Not permitted or user not found" };
 
  await logAction(supabase, "UPDATE_USER_ROLE", "employee", userId, {
      prev: { role: oldUser?.role, company_id: oldUser?.company_id },
      next: dataToUpdate
  });
  return { success: true };
}

export async function assignLead(leadId: string, employeeId: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("leads")
    .update({ employee_id: employeeId })
    .eq("id", leadId)
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data?.length) return { success: false, error: "Not permitted or lead not found" };

  await logAction(supabase, "ASSIGN_LEAD", "lead", leadId, { employee_id: employeeId });
  return { success: true };
}

export async function assignAgentToProduct(agentId: string, productId: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("agent_products")
    .upsert({ agent_id: agentId, product_id: productId });

  if (error) return { success: false, error: error.message };

  await logAction(supabase, "ASSIGN_AGENT_PRODUCT", "agent_product", `${agentId}:${productId}`, { agent_id: agentId, product_id: productId });
  return { success: true };
}

export async function unassignAgentFromProduct(agentId: string, productId: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) return { success: false, error: "Unauthorized" };

  const adminClient = createAdminClient();

  const { error } = await adminClient
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

  const adminClient = createAdminClient();

  const { data: employee, error } = await adminClient
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
 
  const { data, error } = await supabase
    .from("sim_ports")
    .update({ 
        phone_number: phone, 
        company_id: companyId || null,
        updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id");
 
  if (error) {
    return { success: false, error: error.message };
  }
  if (!data?.length) return { success: false, error: "Not permitted or SIM port not found" };
 
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

  const adminClient = createAdminClient();

  // Generate a mock API key (usually this would be done by a database trigger or a more secure method)
  const apiKey = `pk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;

  const { data: product, error } = await adminClient
    .from("products")
    .insert([{ ...data, api_key: apiKey }])
    .select("*, agent_products(agent_id, employees(full_name))")
    .single();

  if (error) return { success: false, error: error.message };
  if (!product) return { success: false, error: "Not permitted or creation failed" };

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
  const generatedPassword = `Agent!${Math.random().toString(36).substring(2, 10).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
  
  try {
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true
    });

    if (inviteError) {
      return { success: false, error: formatEmailError(inviteError) };
    }

    if (inviteData?.user?.id) {
      const { error: upsertError } = await adminClient.from("employees").upsert({
        id: inviteData.user.id,
        email_address: email,
        role: "sales_agent",
        company_id: companyId,
        full_name: name
      });
      if (upsertError) {
         console.error("Failed to upsert agent details:", upsertError);
         return { success: false, error: `Agent created but failed to configure profile: ${upsertError.message}` };
      }
      
      await logAction(supabase, "CREATE_AGENT", "employee", inviteData.user.id, { companyId, name, email });
      
      await sendNotificationEmail({
          recipientEmail: email,
          recipientName: name,
          eventType: "AGENT_PROVISIONED",
          subject: "Your Cloudora CRM Agent Account",
          body: `An agent account has been created for you.<br/><br/>
                 <strong>Login Details:</strong><br/>
                 Email: ${email}<br/>
                 Password: <code>${generatedPassword}</code><br/><br/>
                 Please log in and change your password immediately.`,
      });
    } else {
       console.error("User created but no ID returned from Supabase Auth");
       return { success: false, error: "Agent created but failed to retrieve new account ID." };
    }
  } catch (err) {
    console.error("Exception during agent user creation:", err);
    return { success: false, error: "An unexpected error occurred while creating the agent account." };
  } finally {
     // Optional cleanup
  }

  revalidatePath("/protected/admin");
  return { 
    success: true,
    credentials: { email, password: generatedPassword }
  };
}

export async function adminResetUserPassword(
  targetUserId: string,
  customPassword?: string,
  sendEmailNotification: boolean = true
) {
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

  let emailDispatched = false;
  if (sendEmailNotification) {
    try {
      // Use Supabase native auth email service
      const { error: emailErr } = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email: targetUser.email_address,
      });
      if (!emailErr) {
        emailDispatched = true;
      }
    } catch (e) {
      console.warn("Automated email notification dispatch warning:", e);
    }
  }

  await logAction(supabase, "ADMIN_RESET_PASSWORD", "employee", targetUserId, {
    target_email: targetUser.email_address,
    target_role: targetUser.role,
    email_dispatched: emailDispatched,
  });

  return {
    success: true,
    email: targetUser.email_address,
    fullName: targetUser.full_name,
    generatedPassword: finalPassword,
    emailDispatched,
  };
}

