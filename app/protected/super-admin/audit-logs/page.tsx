import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuditLogTable from "./components/AuditLogTable";

export default async function AuditLogsPage() {
  const supabase = await createClient();

  // Fetch audit logs with actor info
  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("*, actor:employees(full_name, email_address)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching audit logs:", error);
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            Audit <span className="text-orange-600">Intelligence</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium truncate">
            Transparent record of all administrative actions and system state modifications.
        </p>
      </div>

      <section>
        <AuditLogTable initialLogs={logs || []} />
      </section>
    </div>
  );
}
