"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

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

// --- TENANT ACTIONS ---

export async function createTenant(name: string) {
  const supabase = await createClient();
  if (!(await checkSuperAdmin(supabase))) {
      return { success: false, error: "Unauthorized: Super Admin access required" };
  }
 
  const { data, error } = await supabase
    .from("companies")
    .insert({ name })
    .select()
    .single();
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "CREATE_TENANT", "company", data.id, { name });
  return { success: true, data };
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
    .update({ name })
    .eq("id", id);
 
  if (error) {
    return { success: false, error: error.message };
  }
 
  await logAction(supabase, "UPDATE_TENANT", "company", id, { 
      prev: { name: oldTenant?.name }, 
      next: { name } 
  });
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
