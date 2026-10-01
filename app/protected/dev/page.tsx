import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee } from "@/lib/auth/current-employee";
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
  // 1. IDENTITY & ACL GATE
  // Role and company always come from the employees table — never user_metadata
  const employee = await getCurrentEmployee();
  if (!employee) redirect("/auth/login");

  const { role, companyId } = employee;

  // ACL Gate: Allow dev & superadmin only
  if (role !== "dev" && role !== "superadmin") {
    redirect("/protected");
  }

  const isSuperAdmin = role === "superadmin";

  const supabase = await createClient();

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
        userId={employee.userId}
        auditLogs={auditLogs}
      />
    </div>
  );
}
