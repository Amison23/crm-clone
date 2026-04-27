import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PermissionsGrid from "./components/PermissionsGrid";

export default async function PermissionsPage() {
  const supabase = await createClient();

  // Fetch all existing permissions, unique roles, and modules
  const [
    { data: permissions }, 
    { data: employees }, 
    { data: moduleRows }
  ] = await Promise.all([
    supabase.from("role_permissions").select("*"),
    supabase.from("employees").select("role"),
    supabase.from("modules").select("*").order("name")
  ]);

  // Derive unique roles from employees and current permissions
  const roles = Array.from(new Set([
    ...(employees?.map(e => e.role) || []),
    ...(permissions?.map(p => p.role) || []),
    "superadmin", "admin", "sales_agent", "support", "billing" // Baseline fallbacks
  ])).sort();

  const modules = moduleRows || [];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white uppercase">
            Permissions <span className="text-orange-600">Matrix</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Configure real-time role-based access control (RBAC) across system modules.</p>
      </div>

      <section>
        <PermissionsGrid 
            initialPermissions={permissions || []} 
            roles={roles}
            modules={modules}
        />
      </section>
    </div>
  );
}
