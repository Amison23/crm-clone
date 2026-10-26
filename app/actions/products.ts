"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function getCompanyProducts(companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // F-2-4 FIX: Verify the caller belongs to this company (or is superadmin)
  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { success: false, error: "Unauthorized" };
  if (profile.role !== "superadmin" && profile.company_id !== companyId) {
    return { success: false, error: "Unauthorized" };
  }

  const adminClient = createAdminClient();
  const { data: products, error } = await adminClient
    .from("products")
    .select("*")
    .eq("company_id", companyId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Normalize product properties to support both schema column styles
  const normalizedProducts = (products || []).map((p: any) => ({
    ...p,
    name: p.product_name ?? p.name,
    description: p.product_description ?? p.description,
  }));

  return { success: true, products: normalizedProducts };
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
    return { success: false, error: "Unauthorized to add products" };
  }

  const adminClient = createAdminClient();
  
  // The live database schema uses product_name and product_description
  const { data: product, error } = await adminClient
    .from("products")
    .insert({
      company_id: companyId,
      employee_id: user.id,
      product_name: name,
      product_description: product_description
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const normalized = product ? {
    ...product,
    name: (product as any).product_name ?? (product as any).name,
    description: (product as any).product_description ?? (product as any).description
  } : product;

  return { success: true, product: normalized };
}

export async function getAgentProducts(companyId: string) {
  // F-2-6 FIX: Added auth and authorization check before using adminClient
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { success: false, error: "Unauthorized" };
  if (profile.role !== "superadmin" && profile.company_id !== companyId) {
    return { success: false, error: "Unauthorized" };
  }

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
    // If the table doesn't exist yet in the database, return empty gracefully
    if (error.code === "PGRST204" || error.code === "42P01" || error.message?.includes("agent_products")) {
      console.warn("[getAgentProducts] Table agent_products does not exist yet.");
      return { success: true, agentProducts: [] };
    }
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
    
    if (error) {
      if (error.code === "PGRST204" || error.code === "42P01" || error.message?.includes("agent_products")) {
        return { success: false, error: "The 'agent_products' table has not been created in the database yet. Please run the migration script in Supabase SQL Editor." };
      }
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await adminClient
      .from("agent_products")
      .delete()
      .match({ agent_id: agentId, product_id: productId });
    
    if (error) {
      if (error.code === "PGRST204" || error.code === "42P01" || error.message?.includes("agent_products")) {
        return { success: false, error: "The 'agent_products' table has not been created in the database yet. Please run the migration script in Supabase SQL Editor." };
      }
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
