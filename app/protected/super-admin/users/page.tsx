import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserManagementTable from "./components/UserManagementTable";
import { ShieldCheck } from "lucide-react";

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
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none italic">
          User <span className="text-orange-600">Governance</span>
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium italic border-l-2 border-orange-500 ml-1 pl-4">
          Manage administrative roles, tenant associations, and access credentials for the global hub.
        </p>
      </header>

      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden p-2">
        <UserManagementTable 
            initialUsers={employees || []} 
            companies={companies || []}
        />
      </section>
    </div>
  );
}
