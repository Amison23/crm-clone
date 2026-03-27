import { createClient } from "@/lib/supabase/server";
import TicketsClient from "@/components/tickets/TicketsClient";

export default async function TicketsPage() {
  const supabase = await createClient();

  // Get the current user's session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the user's role and company from the employees table
  let role: "admin" | "sales_agent" | "customer" = "sales_agent";
  let companyId = "";

  if (user) {
    const { data: employee } = await supabase
      .from("employees")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (employee?.role === "super_admin" || employee?.role === "company_admin") {
      role = "admin";
    } else if (employee?.role === "sales_agent") {
      role = "sales_agent";
    } else {
      role = "customer";
    }

    companyId = employee?.company_id ?? "";
  }

  // Fetch tickets — customers only see their own
  let ticketsQuery = supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (role === "customer" && user) {
    ticketsQuery = ticketsQuery.eq("client_id", user.id);
  }

  const { data: ticketsData } = await ticketsQuery;

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black leading-tight tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            {role === "customer"
              ? "Submit and track your support requests"
              : "Track and manage active customer support requests"}
          </p>
        </div>
        {role !== "customer" && (
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-xl">ios_share</span>
            Export
          </button>
        )}
      </div>

      {/* Tickets Client side logic */}
      <TicketsClient
        role={role}
        ticketsData={ticketsData}
        companyId={companyId}
        currentUserId={user?.id}
      />
    </>
  );
}
