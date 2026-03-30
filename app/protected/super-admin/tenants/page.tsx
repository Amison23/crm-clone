import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SuperAdminTenantTable from "./components/SuperAdminTenantTable";
import { Building2, Plus, LayoutDashboard } from "lucide-react";
import TenantDialog from "./components/TenantDialog";

export default async function TenantsPage() {
  const supabase = await createClient();

  // Fetch tenants with aggregate metadata for provisioning visibility
  const { data: companies, error } = await supabase
    .from("companies")
    .select(`
      *,
      user_count:employees(count),
      number_count:virtual_numbers(count)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tenants:", error);
  }

  // Refine structure for table
  const tenants = companies?.map(c => ({
      ...c,
      user_count: c.user_count?.[0]?.count || 0,
      number_count: c.number_count?.[0]?.count || 0
  })) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none italic">
            Tenant <span className="text-orange-600">Inventory</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium italic border-l-2 border-orange-500 ml-1 pl-4">
            Manage multi-tenant isolation, company-specific provisioning, and lifecycle states.
          </p>
        </div>
        
        <TenantDialog mode="create">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden">
                <Plus className="size-4 group-hover:rotate-90 transition-transform" />
                Provision New Node
            </button>
        </TenantDialog>
      </header>

      <section>
        <SuperAdminTenantTable initialTenants={tenants} />
      </section>
    </div>
  );
}
