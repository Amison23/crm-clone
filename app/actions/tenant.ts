"use server";

import { createClient } from "@/lib/supabase/server";

export async function joinTenantWithCode(inviteCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Find the company with this invite code
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();

  if (companyError || !company) {
    return { success: false, error: "Invalid invite code. Please check and try again." };
  }

  // Update or insert the employee record for this user
  const { error: upsertError } = await supabase
    .from("employees")
    .upsert({
      id: user.id,
      email_address: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Operator",
      role: "sales_agent", // Default role
      company_id: company.id,
    });

  if (upsertError) {
    return { success: false, error: "Failed to join the organization." };
  }

  return { success: true };
}

export async function generateInviteCode(companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Check if user is admin or superadmin
  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    return { success: false, error: "Unauthorized" };
  }
  
  if (profile.role === "admin" && profile.company_id !== companyId) {
    return { success: false, error: "Unauthorized" };
  }

  // Generate a random 6-character code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { error } = await supabase
    .from("companies")
    .update({ invite_code: code })
    .eq("id", companyId);

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
       // In a real app we'd retry, but for simplicity we'll just error out here
       return { success: false, error: "Collision occurred, try again." };
    }
    return { success: false, error: error.message };
  }

  return { success: true, code };
}

export async function linkExistingUser(companyId: string, email: string, role: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Check if current user is admin or superadmin
  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    return { success: false, error: "Unauthorized" };
  }
  
  if (profile.role === "admin" && profile.company_id !== companyId) {
    return { success: false, error: "Unauthorized" };
  }

  // Look up the target user by email in the employees table
  const { data: targetEmployee, error: lookupError } = await supabase
    .from("employees")
    .select("id")
    .eq("email_address", email)
    .single();

  if (lookupError || !targetEmployee) {
    return { 
      success: false, 
      error: "User not found. Please ensure they have signed up and verified their email first." 
    };
  }

  // Update their company_id and role
  const { error: updateError } = await supabase
    .from("employees")
    .update({ company_id: companyId, role: role })
    .eq("id", targetEmployee.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}
