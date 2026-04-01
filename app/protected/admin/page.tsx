import { createClient } from "@/lib/supabase/server";
import AdminTabs from "@/components/admins/AdminTabs";


export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: employee } = await supabase
    .from("employees")
    .select("id, role, company_id")
    .eq("id", user?.id)
    .single();

  // Fetch company details
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", employee?.company_id)
    .single();

  return (
    <div>
      <AdminTabs user={employee} company={company} />
    </div>
  );
}