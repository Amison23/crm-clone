import { createClient } from "@/lib/supabase/server";
import UserManagementTable from "./components/UserManagementTable";
import PageHeader from "@/components/common/PageHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsersPage() {
  const supabase = await createClient();

  // Fetch all employees and their associated companies synchronously
  const [{ data: employees }, { data: companies }] = await Promise.all([
    supabase
      .from("employees")
      .select("*, companies(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("companies")
      .select("id, name")
      .order("name", { ascending: true })
  ]);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Users"
        description="Manage roles, tenant associations, and access credentials for all platform users."
      />

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <UserManagementTable 
            initialUsers={employees || []} 
            companies={companies || []}
        />
      </section>
    </div>
  );
}
