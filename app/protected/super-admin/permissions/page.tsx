import { createClient } from "@/lib/supabase/server";
import PermissionsGrid from "./components/PermissionsGrid";
import PageHeader from "@/components/common/PageHeader";

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
    "superadmin", "admin", "sales_agent", "server_admin", "dev", "client" // Baseline fallbacks
  ])).sort();

  const modules = moduleRows || [];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Permissions"
        description="Configure role-based access control across system modules in real time."
      />

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
