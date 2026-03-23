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

  // Fetch the user's profile to get their tenant_id
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.tenant_id) {
    return { error: "Unable to find your organization (tenant_id). Please contact support." };
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

  // Insert into leads table using the user's tenant_id
  const { data, error } = await supabase.from("leads").insert([
    {
      tenant_id: profile.tenant_id,
      assigned_to: user.id, // we can optionally assign the lead to the user creating it
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
