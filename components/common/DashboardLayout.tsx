import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/common/DashboardShell";
import UnlinkedAgentScreen from "@/components/common/UnlinkedAgentScreen";
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

// Roles that are platform-wide (not company-scoped)
const PLATFORM_ROLES = new Set(["superadmin"]);

// 2. The AuthGate handles the actual async data fetching
async function AuthGate({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch role and company_id from employees table to ensure sidebar has authoritative info
  const { data: profile, error: profileError } = await supabase
    .from("employees")
    .select("role, company_id, full_name")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Operator";

  // Role MUST come from the employees table only — never trust user_metadata for RBAC.
  // If the user has no employee row yet (brand new signup), send them to the unassigned screen.
  if (!profile || profileError) {
    console.error("[AuthGate] No employee profile found for user:", user.id, profileError?.message);
    return <UnlinkedAgentScreen />;
  }

  const role = profile.role as string;

  console.log("[AuthGate] Resolved role:", role, "| company_id:", profile.company_id, "| for user:", user.id);

  // No-Tenant Gating: unassigned role OR no company linked (platform admins are exempt)
  if (role === "unassigned") {
    return <UnlinkedAgentScreen />;
  }

  // Non-superadmin roles MUST have a company to work within
  if (!PLATFORM_ROLES.has(role) && !profile.company_id) {
    console.warn("[AuthGate] Non-platform role has no company_id:", role, user.id);
    return <UnlinkedAgentScreen />;
  }

  return (
    <DashboardShell name={name} role={role}>
      {children}
    </DashboardShell>
  );
}