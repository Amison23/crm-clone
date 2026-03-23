import { connection } from "next/server";
import { getLeads } from "@/lib/api/leads";
import { LeadsClientWrapper } from "@/components/crm/leads-client-wrapper";

export default async function CrmLeadsTable() {
  await connection();
  const result = await getLeads();

  if (result.error) {
    console.error("Failed to fetch leads:", result.error);
  }

  return (
    <LeadsClientWrapper initialLeads={result.leads || []} />
  );
}