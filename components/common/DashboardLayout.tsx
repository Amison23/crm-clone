import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/common/DashboardShell";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

// 1. The Main Layout becomes a "Pass-through" that doesn't block
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}> 
      <AuthGate>{children}</AuthGate>
    </Suspense>
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