"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export type Colleague = {
  id: string;
  full_name: string | null;
  email_address: string;
  role: string;
  company_id: string | null;
};

export async function getColleagues(): Promise<{
  success: boolean;
  data: Colleague[];
  currentEmployee?: Colleague | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, data: [], error: "Not authenticated" };
    }

    const adminClient = createAdminClient();

    // Fetch current employee profile with full metadata
    const { data: currentEmployee, error: empError } = await adminClient
      .from("employees")
      .select("id, full_name, email_address, role, company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (empError) {
      console.error("[getColleagues] Error fetching current employee:", empError);
      return { success: false, data: [], error: empError.message };
    }

    // Build query for colleagues (excluding clients and self)
    let query = adminClient
      .from("employees")
      .select("id, full_name, email_address, role, company_id")
      .neq("id", user.id)
      .neq("role", "client")
      .order("full_name", { ascending: true });

    // If tenant-scoped user (non-superadmin or superadmin assigned to a company), scope to that company
    if (currentEmployee?.company_id) {
      query = query.eq("company_id", currentEmployee.company_id);
    }

    const { data: colleagues, error: colleaguesError } = await query;

    if (colleaguesError) {
      console.error("[getColleagues] Error fetching colleagues:", colleaguesError);
      return { success: false, data: [], error: colleaguesError.message };
    }

    return {
      success: true,
      data: colleagues || [],
      currentEmployee: currentEmployee || null,
    };
  } catch (err: any) {
    console.error("[getColleagues] Unexpected error:", err);
    return {
      success: false,
      data: [],
      error: err?.message || "Failed to fetch colleagues",
    };
  }
}
