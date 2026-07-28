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
  const { data: profile, error: profileError } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.company_id) {
    return { error: "Unable to find your organization (company_id). Please contact support." };
  }

  // Extract form data
  const company_name = formData.get("client_name") as string || "";
  const contact_name = formData.get("contact_name") as string || "";
  const email = formData.get("email") as string;
  const phone = formData.get("client_phone") as string;
  const status = formData.get("status") as string;
  const product = formData.get("product") as string;
  const institution_type = formData.get("institution_type") as string;
  const need_identified = formData.get("need_identified") as string;
  const next_action = formData.get("next_action") as string;
  const next_action_date = formData.get("next_action_date") as string;
  const user_notes = formData.get("notes") as string;

  // Map to DB schema
  const nameParts = contact_name.trim().split(" ");
  const first_name = nameParts[0] || "Unknown";
  const last_name = nameParts.slice(1).join(" ") || "Unknown";

  let notes = user_notes ? user_notes + "\n\n" : "";
  if (product) notes += `Product: ${product}\n`;
  if (institution_type) notes += `Institution: ${institution_type}\n`;
  if (need_identified) notes += `Need: ${need_identified}\n`;
  if (next_action) notes += `Next Action: ${next_action} (${next_action_date || 'No date'})\n`;

  // Validate required fields
  if (!contact_name || !phone) {
    return { error: "Contact Name and Phone are required fields." };
  }

  // Insert into leads table using the user's tenant_id
  const { data, error } = await supabase.from("leads").insert([
    {
      company_id: profile.company_id,
      employee_id: user.id, // assigned to the user creating it
      first_name,
      last_name,
      company_name,
      email,
      phone,
      source: "Manual",
      status: status || "new",
      notes: notes.trim(),
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
