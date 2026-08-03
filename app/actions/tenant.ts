"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

const AMBIGUOUS_CHARS = /[0O1I]/g;

function generateSecureCode() {
  let code = '';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded 0, O, 1, I
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function joinTenantWithCode(inviteCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const adminClient = createAdminClient();

  // Try to lock and redeem the invite code atomically
  // The .is('used_at', null) ensures race conditions are handled (only 1 can succeed)
  const { data: invite, error: inviteError } = await adminClient
    .from("invite_codes")
    .update({ 
      used_at: new Date().toISOString(),
      used_by: user.id 
    })
    .eq("code", inviteCode)
    .is("used_at", null)
    .eq("revoked", false)
    .gt("expires_at", new Date().toISOString())
    .select()
    .single();

  if (inviteError || !invite) {
    return { success: false, error: "Invalid, expired, or already used invite code." };
  }

  // Update or insert the employee record for this user
  const { error: upsertError } = await supabase
    .from("employees")
    .upsert({
      id: user.id,
      email_address: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Operator",
      role: "sales_agent", // Default role
      company_id: invite.company_id,
    });

  if (upsertError) {
    // Ideally we would roll back the invite code here, but for now we return the error
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

  const code = generateSecureCode();
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("invite_codes")
    .insert({
      company_id: companyId,
      code,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation on code
       return { success: false, error: "Collision occurred, try again." };
    }
    return { success: false, error: error.message };
  }

  return { success: true, code };
}

export async function getActiveInvites(companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin") || (profile.role === "admin" && profile.company_id !== companyId)) {
    return { success: false, error: "Unauthorized" };
  }

  const adminClient = createAdminClient();
  const { data: invites, error } = await adminClient
    .from("invite_codes")
    .select("*")
    .eq("company_id", companyId)
    .is("used_at", null)
    .eq("revoked", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, invites };
}

export async function revokeInviteCode(companyId: string, inviteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin") || (profile.role === "admin" && profile.company_id !== companyId)) {
    return { success: false, error: "Unauthorized" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("invite_codes")
    .update({ revoked: true })
    .eq("id", inviteId)
    .eq("company_id", companyId);

  if (error) return { success: false, error: error.message };
  return { success: true };
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

export async function getAgentMetrics(companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin") || (profile.role === "admin" && profile.company_id !== companyId)) {
    return { success: false, error: "Unauthorized" };
  }

  // Fetch leads
  const { data: leads } = await supabase
    .from("leads")
    .select("employee_id, status")
    .eq("company_id", companyId)
    .not("employee_id", "is", null);

  // Fetch tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select("assigned_to, status")
    .eq("company_id", companyId)
    .not("assigned_to", "is", null);

  // Fetch agent products
  const { data: agentProducts } = await supabase
    .from("agent_products")
    .select(`
      agent_id,
      products ( name )
    `); // The RLS policies handle the scoping

  const metrics: Record<string, {
    leadsAssigned: number;
    leadsConverted: number;
    ticketsAssigned: number;
    ticketsResolved: number;
    products: string[];
  }> = {};

  if (leads) {
    leads.forEach(lead => {
      const id = lead.employee_id;
      if (!metrics[id]) metrics[id] = { leadsAssigned: 0, leadsConverted: 0, ticketsAssigned: 0, ticketsResolved: 0, products: [] };
      metrics[id].leadsAssigned++;
      if (lead.status === "qualified") metrics[id].leadsConverted++;
    });
  }

  if (tickets) {
    tickets.forEach(ticket => {
      const id = ticket.assigned_to;
      if (!metrics[id]) metrics[id] = { leadsAssigned: 0, leadsConverted: 0, ticketsAssigned: 0, ticketsResolved: 0, products: [] };
      metrics[id].ticketsAssigned++;
      if (ticket.status === "resolved") metrics[id].ticketsResolved++;
    });
  }

  if (agentProducts) {
    agentProducts.forEach((ap: any) => {
      const id = ap.agent_id;
      if (!metrics[id]) metrics[id] = { leadsAssigned: 0, leadsConverted: 0, ticketsAssigned: 0, ticketsResolved: 0, products: [] };
      if (ap.products?.name) {
        metrics[id].products.push(ap.products.name);
      }
    });
  }

  return { success: true, metrics };
}
