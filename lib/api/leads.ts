"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotificationEmail } from "@/lib/notifications/email";

/**
 * INTELLIGENCE ENGINE v3.0 - LEAD PROTOCOLS
 * Scoped via Row-Level Security and Tenant Metadata.
 */

export async function createLeadAction(formData: FormData) {
  const supabase = await createClient();

  // 1. IDENTITY & TENANT RESOLUTION
  // tenant_id is not baked into the JWT — resolve company_id from the employees table
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Node Access Denied: Authentication Required" };

  const { data: employee } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", user.id)
    .single();

  const tenant_id = employee?.company_id;
  if (!tenant_id) return { error: "Security Violation: Null Tenant Context" };

  // 2. DATA EXTRACTION
  const company_name = formData.get("client_name") as string || "";
  const contact_name = formData.get("contact_name") as string || "";
  const phone = formData.get("client_phone") as string;
  const email = formData.get("email") as string;
  const status = formData.get("status") as string;
  const product = formData.get("product") as string;
  const institution_type = formData.get("institution_type") as string;
  const need_identified = formData.get("need_identified") as string;
  const next_action = formData.get("next_action") as string;
  const next_action_date = formData.get("next_action_date") as string;
  const user_notes = formData.get("notes") as string;

  // 3. VALIDATION
  if (!company_name || !phone || !product) {
    return { error: "Security/HCI Requirement: Client Name, Phone, and Product are mandatory." };
  }

  // 4. MAP TO SCHEMA & PERSISTENCE
  const nameParts = contact_name.trim().split(" ");
  const first_name = nameParts[0] || "Unknown";
  const last_name = nameParts.slice(1).join(" ") || "Unknown";

  let final_notes = user_notes ? user_notes + "\n\n" : "";
  if (product) final_notes += `Product: ${product}\n`;
  if (institution_type) final_notes += `Institution: ${institution_type}\n`;
  if (need_identified) final_notes += `Need: ${need_identified}\n`;
  if (next_action) final_notes += `Next Action: ${next_action} (${next_action_date || 'No date'})\n`;

  const { error } = await supabase.from("leads").insert([
    {
      company_id: tenant_id,
      employee_id: user.id,
      company_name,
      first_name,
      last_name,
      phone,
      email,
      source: "Manual",
      status: status || "new",
      notes: final_notes.trim(),
    },
  ]);

  if (error) {
    console.error("Lead Protocol Failure:", error.message);
    return { error: "Database rejected lead insertion. Check constraints." };
  }

  // 5. CACHE INVALIDATION
  // We revalidate Analytics too because a new lead changes the Summary Cards!
  revalidatePath("/protected/crm-leads-table");
  revalidatePath("/protected/analytics-and-reporting");

  return { success: true };
}

export async function updateLeadAction(leadId: string, payload: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized Node Access" };

  let updateData = payload;
  if (payload instanceof FormData) {
    const formData = payload;
    const company_name = formData.get("client_name") as string || "";
    const contact_name = formData.get("contact_name") as string || "";
    const phone = formData.get("client_phone") as string;
    const email = formData.get("email") as string;
    const status = formData.get("status") as string;
    const product = formData.get("product") as string;
    const institution_type = formData.get("institution_type") as string;
    const need_identified = formData.get("need_identified") as string;
    const next_action = formData.get("next_action") as string;
    const next_action_date = formData.get("next_action_date") as string;
    const user_notes = formData.get("notes") as string;

    const nameParts = contact_name.trim().split(" ");
    const first_name = nameParts[0] || "Unknown";
    const last_name = nameParts.slice(1).join(" ") || "Unknown";

    let final_notes = user_notes ? user_notes + "\n\n" : "";
    if (product) final_notes += `Product: ${product}\n`;
    if (institution_type) final_notes += `Institution: ${institution_type}\n`;
    if (need_identified) final_notes += `Need: ${need_identified}\n`;
    if (next_action) final_notes += `Next Action: ${next_action} (${next_action_date || 'No date'})\n`;

    updateData = {
      company_name,
      first_name,
      last_name,
      phone,
      email,
      status: status || "new",
      notes: final_notes.trim(),
    };
  }

  // Logic: Update handles potential_value which feeds the Revenue charts
  const { error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", leadId);

  if (error) return { error: error.message };
  
  revalidatePath("/protected/crm-leads-table");
  revalidatePath("/protected/analytics-and-reporting");
  return { success: true };
}

export async function deleteLeadAction(leadId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized Node Access" };

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId);

  if (error) return { error: error.message };

  revalidatePath("/protected/crm-leads-table");
  revalidatePath("/protected/analytics-and-reporting");
  return { success: true };
}

export async function getLeads() {
  const supabase = await createClient();

  // Resolve tenant from employees table — tenant_id is not stored in the JWT metadata
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: employee } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", user.id)
    .single();

  const tenantId = employee?.company_id;
  if (!tenantId) return { error: "No active tenant node found." };

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .eq("company_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const {data: salesAgents} = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("role", "sales_agent")
    .eq("company_id", tenantId)
  
  
    return { leads, salesAgents };
}

export async function assignSalesAgents(leadId: string, employeeId: string){
  const supabase = await createClient()

  const {data: {user}} = await supabase.auth.getUser()
  if(!user) return {error: 'Unauthorized'}

  const {error} = await supabase
    .from("leads")
    .update({ employee_id: employeeId })
    .eq("id", leadId);

  if(error) return {error: error.message};

  // Fetch assigned agent email for notification
  const { data: agent } = await supabase
    .from("employees")
    .select("email_address, full_name")
    .eq("id", employeeId)
    .single();

  if (agent?.email_address) {
    await sendNotificationEmail({
      recipientEmail: agent.email_address,
      recipientName: agent.full_name || undefined,
      eventType: "LEAD_REASSIGNED",
      subject: "New Lead Assigned To You",
      body: `You have been assigned ownership of lead ${leadId}. Please log in to your console to review details.`,
      metadata: { leadId, assignedBy: user.id }
    });
  }

  revalidatePath("/protected/crm-leads-table");
  return {success: true};
}