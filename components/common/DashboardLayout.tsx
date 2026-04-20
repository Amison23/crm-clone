import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/common/DashboardShell";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Operator";
  const role = user.user_metadata?.role;

  return <DashboardShell name={name} role={role}>{children}</DashboardShell>;
}