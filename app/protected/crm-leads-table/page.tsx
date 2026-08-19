import { Suspense } from "react";
import { connection } from "next/server";
import { getLeads } from "@/lib/api/leads";
import { getTasks } from "@/lib/api/tasks";
import { LeadsClientWrapper } from "@/components/crm/leads-client-wrapper";

export default function CrmLeadsTablePage() {
  return (
    <Suspense fallback={<LeadsTableSkeleton />}>
      <CrmLeadsTableData />
    </Suspense>
  );
}

async function CrmLeadsTableData() {
  await connection();
  const [leadsRes, tasksRes] = await Promise.all([
    getLeads(),
    getTasks(),
  ]);

  if (leadsRes.error) {
    console.error("Failed to fetch leads:", leadsRes.error);
  }
  if (tasksRes.error) {
    console.error("Failed to fetch tasks:", tasksRes.error);
  }

  return (
    <LeadsClientWrapper
      initialLeads={leadsRes.leads || []}
      salesAgents={leadsRes.salesAgents || []}
      initialTasks={tasksRes.tasks || []}
    />
  );
}

function LeadsTableSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-[500px] w-full bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800" />
    </div>
  );
}