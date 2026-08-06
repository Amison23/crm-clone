import { createClient } from "@/lib/supabase/server";
import AgentManagementClient from "./components/AgentManagementClient";
import PageHeader from "@/components/common/PageHeader";

export default async function AgentsPage() {
  const supabase = await createClient();

  // 1. Fetch Agents (Employees) with their company names
  const { data: agents } = await supabase
    .from("employees")
    .select("*, companies(name)")
    .order("created_at", { ascending: false });

  // 2. Fetch SaaS Products with their assigned agents
  const { data: products } = await supabase
    .from("products")
    .select("*, agent_products(agent_id, employees(full_name))")
    .order("name", { ascending: true });

  // 3. Fetch Friction/Density Audit Points
  const { data: frictionData } = await supabase
    .from("view_operational_audit")
    .select("*")
    .in("metric_type", ["FRICTION", "DENSITY"]);

  // 4. Fetch Companies for the "Add Agent" dialog
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Agent Management"
        description="Manage operator roles, lead routing, and product assignments across all tenants."
      />

      <AgentManagementClient 
        initialAgents={agents || []}
        products={products || []}
        frictionData={frictionData || []}
        companies={companies || []}
      />
    </div>
  );
}