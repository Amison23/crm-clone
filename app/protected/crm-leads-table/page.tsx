import { Suspense } from "react";
import { connection } from "next/server";
import { getLeads } from "@/lib/api/leads";
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
  const result = await getLeads();

  if (result.error) {
    console.error("Failed to fetch leads:", result.error);
  }

  return (
    <LeadsClientWrapper initialLeads={result.leads || []} />
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