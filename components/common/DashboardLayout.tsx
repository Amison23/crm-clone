import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/common/DashboardShell";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

// 1. The Main Layout becomes a "Pass-through" that doesn't block
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}> 
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-950">
      <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800 flex-col" />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800" />
        <div className="p-8 flex flex-col gap-8 flex-1 animate-pulse">
          <div className="h-8 w-64 bg-slate-100 dark:bg-slate-900 rounded-lg" />
          <div className="h-32 w-full bg-slate-100 dark:bg-slate-900 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// 2. The AuthGate handles the actual async data fetching
async function AuthGate({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  
  // This is the call that was blocking navigation
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Operator";
  const role = user.user_metadata?.role;

  return (
    <DashboardShell name={name} role={role}>
      {children}
    </DashboardShell>
  );
}