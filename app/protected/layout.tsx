import Dashboard from "@/components/common/Dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return (
    <div className="flex min-h-screen">
      <Dashboard role={data?.user?.role}>
        {children}
      </Dashboard>
    </div>

  )
}
