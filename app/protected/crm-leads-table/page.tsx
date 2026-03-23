import { createClient } from "@/lib/supabase/server";
import { LeadsClientWrapper } from "@/components/crm/leads-client-wrapper";

export default async function CrmLeadsTable() {
  const supabase = await createClient();
  
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch leads:", error.message);
  }

  return (
    <LeadsClientWrapper initialLeads={leads || []} />
  );
}