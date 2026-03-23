"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLeadAction(formData: FormData) {
  const supabase = await createClient();

  // Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in to add a lead." };
  }

  // Fetch the user's employee profile to get their company_id
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (employeeError || !employee?.company_id) {
    return { error: "Unable to find your organization (company_id). Please contact support." };
  }

  // Extract form data
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const company_name = formData.get("company_name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const source = formData.get("source") as string;
  const status = formData.get("status") as string;

  // Validate required fields
  if (!first_name || !phone) {
    return { error: "First Name and Phone are required fields." };
  }

  // Insert into leads table using the user's company_id
  const { data, error } = await supabase.from("leads").insert([
    {
      company_id: employee.company_id,
      assigned_to: user.id, // we optionally assign the lead to the user creating it
      first_name,
      last_name,
      company_name,
      email,
      phone,
      source,
      status: status || "new",
    },
  ]);

  if (error) {
    console.error("Error creating lead:", error.message);
    return { error: error.message };
  }

  // Revalidate the route so the table updates
  revalidatePath("/protected/crm-leads-table");

  return { success: true };
}

export async function updateLeadAction(leadId: string, payload: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("leads").update(payload).eq("id", leadId);
  if (error) return { error: error.message };
  
  revalidatePath("/protected/crm-leads-table");
  return { success: true };
}

export async function deleteLeadAction(leadId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("leads").delete().eq("id", leadId);
  if (error) return { error: error.message };

  revalidatePath("/protected/crm-leads-table");
  return { success: true };
}

export async function getLeads() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: employee } = await supabase.from("employees").select("company_id").eq("id", user.id).single();
  if (!employee?.company_id) return { error: "No company found" };

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .eq("company_id", employee.company_id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { leads };
}
