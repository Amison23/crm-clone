"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  const client_name = formData.get("client_name") as string;
  const contact_name = formData.get("contact_name") as string;
  const client_phone = formData.get("client_phone") as string;
  const email = formData.get("email") as string;
  const status = formData.get("status") as string;
  const institution_type = formData.get("institution_type") as string;
  const product = formData.get("product") as string;
  const next_action = formData.get("next_action") as string;
  const next_action_date = formData.get("next_action_date") as string;
  const need_identified = formData.get("need_identified") as string;
  const notes = formData.get("notes") as string;

  // 3. VALIDATION
  if (!client_name || !client_phone || !product) {
    return { error: "Security/HCI Requirement: Client Name, Phone, and Product are mandatory." };
  }

  // 4. PERSISTENCE
  const { error } = await supabase.from("leads").insert([
    {
      company_id: tenant_id,
      employee_id: user.id, 
      client_name,
      contact_name,
      client_phone,
      email,
      status: status || "new",
      institution_type,
      product,
      next_action,
      next_action_date,
      need_identified,
      notes,
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

  // Logic: Update handles potential_value which feeds the Revenue charts
  const { error } = await supabase
    .from("leads")
    .update(payload)
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
  return { leads };
}