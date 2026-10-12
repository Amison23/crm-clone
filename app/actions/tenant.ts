"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/notifications/email";

const AMBIGUOUS_CHARS = /[0O1I]/g;

function generateSecureCode() {
  let code = '';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded 0, O, 1, I
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function requestInviteCodeEmail() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("employees")
    .select("full_name, email_address, company_id, companies(name)")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.company_id) {
    return { success: false, error: "You are not assigned to any company." };
  }

  const adminClient = createAdminClient();
  const { data: invite } = await adminClient
    .from("invite_codes")
    .select("code")
    .eq("company_id", profile.company_id)
    .is("used_at", null)
    .eq("revoked", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!invite) {
    return { success: false, error: "No active invite code found for your company. Please contact your administrator." };
  }

  // Cast companies to any because it might be an array or object
  const companyData = profile.companies as any;
  const companyName = companyData?.name || "your company";
  
  const body = `
    Hello ${profile.full_name || 'there'},<br/><br/>
    You requested the verification code to complete your setup at <strong>${companyName}</strong> on Cloudora.<br/><br/>
    Your Company Verification Code is: <strong style="font-family: monospace; font-size: 18px; color: #4f46e5; letter-spacing: 2px;">${invite.code}</strong><br/><br/>
    Please enter this code in the onboarding screen to securely verify your access.<br/><br/>
    If you did not request this, please contact your administrator immediately.
  `;

  const { success, error } = await sendNotificationEmail({
    recipientEmail: profile.email_address,
    recipientName: profile.full_name || undefined,
    eventType: 'INVITE_CODE_REQUEST',
    subject: `Your Cloudora Verification Code for ${companyName}`,
    body: body
  });

  if (!success) {
    return { success: false, error: error || "Failed to send email." };
  }

  return { success: true };
}

export async function completeOnboarding(fullName: string, inviteCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters." };
  }
  
  if (!inviteCode || inviteCode.trim().length === 0) {
    return { success: false, error: "Company invite code is required." };
  }

  // Fetch the user's company_id
  const { data: profile } = await supabase.from("employees").select("company_id").eq("id", user.id).single();
  
  if (!profile || !profile.company_id) {
    return { success: false, error: "You are not assigned to any company." };
  }

  const adminClient = createAdminClient();

  // Verify the invite code belongs to their company and is active
  const { data: invite } = await adminClient
    .from("invite_codes")
    .select("id")
    .eq("company_id", profile.company_id)
    .eq("code", inviteCode.trim())
    .is("used_at", null)
    .eq("revoked", false)
    .gt("expires_at", new Date().toISOString())
    .single();
    
  if (!invite) {
    return { success: false, error: "Invalid, expired, or used company invite code." };
  }

  const { error } = await supabase
    .from("employees")
    .update({ full_name: fullName.trim(), is_verified: true })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function joinTenantWithCode(inviteCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: validCompanyId, error: rpcError } = await supabase.rpc('redeem_invite_code', { p_code: inviteCode });

  if (rpcError || !validCompanyId) {
    return { success: false, error: "Invalid, expired, or already used invite code." };
  }

  const adminClient = createAdminClient();

  // Update or insert the employee record for this user using adminClient to bypass self-escalation block
  const { error: upsertError } = await adminClient
    .from("employees")
    .upsert({
      id: user.id,
      email_address: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Operator",
      role: "sales_agent", // Default role
      company_id: validCompanyId,
      is_verified: true,
    });

  if (upsertError) {
    // Rollback the invite code consumption if user update fails
    await adminClient
      .from("invite_codes")
      .update({ used_at: null, used_by: null })
      .eq("code", inviteCode)
      .eq("used_by", user.id);

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

export async function provisionAgentByCompanyAdmin(companyId: string, email: string, role: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    return { success: false, error: "Unauthorized" };
  }
  
  if (profile.role === "admin" && !["sales_agent", "dev"].includes(role)) {
    return { success: false, error: "Invalid role for admin assignment" };
  }
  if (profile.role === "superadmin" && !["sales_agent", "dev", "admin", "server_admin"].includes(role)) {
    return { success: false, error: "Invalid role for superadmin assignment" };
  }

  const targetCompanyId = profile.role === "admin" ? profile.company_id! : companyId;
  if (!targetCompanyId) {
    return { success: false, error: "Invalid organization context" };
  }

  const cleanEmail = email.trim().toLowerCase();
  const defaultName = cleanEmail.split("@")[0] || "New Agent";
  const adminClient = createAdminClient();

  // Check if email exists
  const escapedEmail = cleanEmail.replace(/[\\%_]/g, '\\$&');
  const { data: existingEmp } = await adminClient
    .from("employees")
    .select("id")
    .ilike("email_address", escapedEmail)
    .maybeSingle();
  if (existingEmp) {
    return { success: false, error: "This email is already registered." };
  }

  const crypto = require('crypto');
  const generatedPassword = crypto.randomBytes(9).toString('base64url') + 'Aa1!';

  // Create Auth User
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.createUser({
    email: cleanEmail,
    password: generatedPassword,
    email_confirm: true
  });

  if (inviteError) {
    return { success: false, error: `Failed to create auth user: ${inviteError.message}` };
  }

  const newAuthUserId = inviteData?.user?.id;
  if (!newAuthUserId) return { success: false, error: "Failed to retrieve new account ID." };

  // Create Employee Record
  const { error: upsertError } = await adminClient.from("employees").upsert({
    id: newAuthUserId,
    email_address: cleanEmail,
    role: role,
    company_id: targetCompanyId,
    full_name: defaultName,
    is_verified: true,
  });

  if (upsertError) {
    await adminClient.auth.admin.deleteUser(newAuthUserId);
    return { success: false, error: "Failed to create agent profile, rolled back." };
  }

  return { success: true, credentials: { email: cleanEmail, password: generatedPassword } };
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
