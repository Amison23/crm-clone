import { createClient } from "@/lib/supabase/server";
import AgentManagementClient from "./components/AgentManagementClient";

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
    <div className="space-y-10">
      <header>
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
          Agent <span className="text-primary">Management</span>
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium italic border-l-2 border-primary ml-1 pl-4">
          Orchestrate lead routing, audit operator friction, and provision administrative identities.
        </p>
      </header>

      <AgentManagementClient 
        initialAgents={agents || []}
        products={products || []}
        frictionData={frictionData || []}
        companies={companies || []}
      />
    </div>
  );
}