import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTasks } from "@/lib/api/tasks";
import { DevWorkspaceView } from "@/components/dev/DevWorkspaceView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * DEV ROLE WORKSPACE NODE
 * Dedicated dashboard for Developers ('dev' role).
 * Features assigned dev tasks, internal team chat, and telemetry.
 */
export default async function DevWorkspacePage() {
  const supabase = await createClient();

  // 1. IDENTITY & ACL GATE
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let role = user.user_metadata?.role;
  let companyId = user.user_metadata?.company_id;

  if (!role || !companyId) {
    const { data: employee } = await supabase
      .from("employees")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (employee) {
      role = role || employee.role;
      companyId = companyId || employee.company_id;
    }
  }

  // ACL Gate: Allow dev & superadmin only
  if (role !== "dev" && role !== "superadmin" && role !== "super_admin") {
    redirect("/protected");
  }

  const isSuperAdmin = role === "superadmin" || role === "super_admin";

  let logsQuery = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!isSuperAdmin && companyId) {
    logsQuery = logsQuery.eq("company_id", companyId);
  }

  // 2. FETCH DEV ASSIGNED TASKS, COMPANY CONTEXT & AUDIT LOGS
  const [tasksRes, companyRes, logsRes] = await Promise.all([
    getTasks(),
    companyId ? supabase.from("companies").select("name").eq("id", companyId).single() : Promise.resolve({ data: null }),
    logsQuery,
  ]);

  const devTasks = tasksRes.tasks || [];
  const companyName = companyRes.data?.name || "Dev Node";
  const auditLogs = logsRes.data || [];

  return (
    <div className="p-6 md:p-10 w-full animate-in fade-in duration-700 pb-24">
      <DevWorkspaceView
        initialTasks={devTasks}
        companyName={companyName}
        userId={user.id}
        auditLogs={auditLogs}
      />
    </div>
  );
}
