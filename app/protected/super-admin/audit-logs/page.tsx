import { createClient } from "@/lib/supabase/server";
import AuditLogTable from "./components/AuditLogTable";
import PageHeader from "@/components/common/PageHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <PageHeader
        title="Audit Logs"
        description="Transparent record of all administrative actions and platform state changes."
      />

      <section>
        <AuditLogTable initialLogs={logs || []} />
      </section>
    </div>
  );
}
