import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SuperAdminSidebar from "./components/SuperAdminSidebar";

export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // 1. AUTH & ROLE CHECK (Server-side)
  // We check the role from the 'employees' table for strict RBAC
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile, error } = await supabase
    .from("employees")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "superadmin") {
    console.error("Super Admin access denied for user:", user.id);
    redirect("/dashboard"); // Redirect to regular dashboard if not super admin
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar Navigation */}
      <SuperAdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
