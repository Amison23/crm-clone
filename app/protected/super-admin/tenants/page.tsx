import { createClient } from "@/lib/supabase/server";
import SuperAdminTenantTable from "./components/SuperAdminTenantTable";
import TenantDialog from "./components/TenantDialog";
import { Plus } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

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
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Tenants"
        description="Manage company workspaces, provisioning lifecycle, and tenant isolation."
        action={
          <TenantDialog mode="create">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium shadow hover:opacity-90 active:scale-95 transition-all">
              <Plus className="size-4" />
              New Company
            </button>
          </TenantDialog>
        }
      />

      <section>
        <SuperAdminTenantTable initialTenants={tenants} />
      </section>
    </div>
  );
}
