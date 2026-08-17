"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrgRoles(companyId?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { data: employee } = await supabase
      .from("employees")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (!employee) return { success: false, error: "Unauthorized" };

    const targetCompanyId = employee.role === "superadmin" ? (companyId || employee.company_id) : employee.company_id;

    if (!targetCompanyId) return { success: false, error: "Null company context" };

    const { data: roles, error } = await supabase
      .from("org_custom_roles")
      .select("*")
      .eq("company_id", targetCompanyId)
      .order("created_at", { ascending: true });

    if (error) return { success: false, error: error.message };

    return { success: true, roles: roles || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createOrgRole(name: string, description: string, permissions: string[], companyId?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { data: employee } = await supabase
      .from("employees")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (!employee || (employee.role !== "admin" && employee.role !== "superadmin")) {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    const targetCompanyId = employee.role === "superadmin" ? (companyId || employee.company_id) : employee.company_id;

    if (!targetCompanyId) return { success: false, error: "Null company context" };

    const { data: newRole, error } = await supabase
      .from("org_custom_roles")
      .insert({
        company_id: targetCompanyId,
        name,
        description,
        permissions,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, role: newRole };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteOrgRole(roleId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { data: employee } = await supabase
      .from("employees")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (!employee || (employee.role !== "admin" && employee.role !== "superadmin")) {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    const { error } = await supabase
      .from("org_custom_roles")
      .delete()
      .eq("id", roleId)
      .eq("company_id", employee.company_id);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
