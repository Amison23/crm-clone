"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * INTELLIGENCE ENGINE v3.0 - LEAD PROTOCOLS
 * Scoped via Row-Level Security and Tenant Metadata.
 */

export async function createLeadAction(formData: FormData) {
  const supabase = await createClient();

  // 1. IDENTITY & METADATA EXTRACTION
  // HCI: Reducing DB hops by using JWT metadata instead of querying 'employees' table
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Node Access Denied: Authentication Required" };

  const tenant_id = user.user_metadata?.tenant_id;
  if (!tenant_id) return { error: "Security Violation: Null Tenant Context" };

  // 2. DATA EXTRACTION
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const company_name = formData.get("company_name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const source = formData.get("source") as string;
  const status = formData.get("status") as string;
  const potential_value = formData.get("potential_value") as string;

  // 3. VALIDATION
  if (!first_name || !phone) {
    return { error: "HCI Requirement: Primary fields (Name/Phone) cannot be null." };
  }

  // 4. PERSISTENCE
  // Logic: Using 'employee_id' to match your DDL schema exactly
  const { error } = await supabase.from("leads").insert([
    {
      company_id: tenant_id,
      employee_id: user.id, 
      first_name,
      last_name,
      company_name,
      email,
      phone,
      source: source || "Direct Entry",
      status: status || "new",
      potential_value: parseFloat(potential_value) || 0,
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
  
  // Logic: Directly get tenant from metadata for max speed
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenant_id;

  if (!tenantId) return { error: "No active tenant node found." };

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .eq("company_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { leads };
}