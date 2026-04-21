import { Suspense } from "react";
import Dashboard from "@/components/common/Dashboard";
import { createClient } from "@/lib/supabase/server";

// 1. Extract the blocking data fetch into its own async component
async function DashboardShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <Dashboard role={data?.user?.role}>
      {children}
    </Dashboard>
  );
}

// 2. Keep the main layout non-blocking and wrap the async shell in Suspense
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Next.js will instantly render the shell and show the fallback 
        while Supabase fetches the user data in the background.
      */}
      <Suspense 
        fallback={
          <div className="flex items-center justify-center w-full h-screen text-slate-400 animate-pulse font-bold tracking-widest uppercase text-xs">
            Authenticating...
          </div>
        }
      >
        <DashboardShell>
          {children}
        </DashboardShell>
      </Suspense>
    </div>
  );
}