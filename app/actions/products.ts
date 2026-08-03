"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function getCompanyProducts(companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const adminClient = createAdminClient();
  
  // We use adminClient to bypass RLS, because products RLS might be strict
  const { data: products, error } = await adminClient
    .from("products")
    .select("*")
    .eq("company_id", companyId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, products };
}

export async function createCompanyProduct(companyId: string, name: string, product_description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Verify the user is a company admin for this company
  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.company_id !== companyId) {
    return { success: false, error: "Unauthorized" };
  }

  const adminClient = createAdminClient();
  
  const { data: product, error } = await adminClient
    .from("products")
    .insert({
      name,
      description: product_description,
      company_id: companyId
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, product };
}

export async function getAgentProducts(companyId: string) {
  const adminClient = createAdminClient();
  
  // Get all agents in this company
  const { data: employees } = await adminClient
    .from("employees")
    .select("id")
    .eq("company_id", companyId);

  if (!employees || employees.length === 0) return { success: true, agentProducts: [] };
  
  const agentIds = employees.map(e => e.id);

  const { data: agentProducts, error } = await adminClient
    .from("agent_products")
    .select("*")
    .in("agent_id", agentIds);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, agentProducts };
}

export async function toggleAgentProduct(companyId: string, agentId: string, productId: string, assign: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Verify the user is a company admin for this company
  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.company_id !== companyId) {
    return { success: false, error: "Unauthorized" };
  }

  const adminClient = createAdminClient();

  // Validate the product belongs to the company
  const { data: productCheck, error: productError } = await adminClient
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("company_id", companyId)
    .single();

  if (productError || !productCheck) {
    return { success: false, error: "Invalid product or unauthorized" };
  }

  if (assign) {
    const { error } = await adminClient
      .from("agent_products")
      .insert({ agent_id: agentId, product_id: productId });
    
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await adminClient
      .from("agent_products")
      .delete()
      .match({ agent_id: agentId, product_id: productId });
    
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}
