import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Super Admin Layout — Auth guard only.
 * The outer DashboardShell (from /protected/layout.tsx) provides
 * the sidebar and shell. This layout just enforces the superadmin
 * role check before allowing any child page to render.
 */
export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error } = await supabase
    .from("employees")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "superadmin") {
    console.error("Super Admin access denied for user:", user.id);
    redirect("/protected");
  }

  return <>{children}</>;
}
