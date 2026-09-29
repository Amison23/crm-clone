import { createClient } from "@/lib/supabase/server";
import TicketsClient from "@/components/tickets/TicketsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TicketsPage() {
  const supabase = await createClient();

  // Get the current user's session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the user's role and company from the employees table
  let role: "admin" | "sales_agent" | "client" = "admin";
  let actualRole: string | undefined;
  let companyId = "";

  if (user) {
    const { data: employee } = await supabase
      .from("employees")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    actualRole = employee?.role;

    if (
      employee?.role === "superadmin" ||
      employee?.role === "admin" ||
      employee?.role === "server_admin"
    ) {
      role = "admin";
    } else if (employee?.role === "sales_agent" || employee?.role === "dev") {
      role = "sales_agent";
    } else {
      role = "client";
    }

    companyId = employee?.company_id ?? "";
  }

  // Fetch tickets with joined customer and employee data
  let ticketsQuery = supabase
    .from("tickets")
    .select(`
      *,
      assigned_agent:employees!tickets_assigned_to_fkey(id, full_name, role),
      customer:customers!tickets_client_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false });

  if (role === "client" && user) {
    // Clients only see their own tickets
    ticketsQuery = ticketsQuery.eq("client_id", user.id);
  } else if (companyId) {
    // Admins & agents only see their company's tickets
    ticketsQuery = ticketsQuery.eq("company_id", companyId);
  }

  const { data: ticketsData } = await ticketsQuery;

  const finalTicketsData = ticketsData ?? [];

  // Fetch all employees for the company (to show workload even for those with 0 tickets)
  let employees: any[] = [];
  if (companyId && (role === "admin" || role === "sales_agent")) {
    const { data: empData } = await supabase
      .from("employees")
      .select("id, full_name, role")
      .eq("company_id", companyId);
    employees = empData ?? [];
  }

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black leading-tight tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            {role === "client"
              ? "Submit and track your support requests"
              : "Track and manage active customer support requests"}
          </p>
        </div>
      </div>

      {/* Tickets Client side logic */}
      <TicketsClient
        role={role}
        actualRole={actualRole}
        ticketsData={finalTicketsData}
        companyEmployees={employees}
        companyId={companyId}
        currentUserId={user?.id}
      />
    </>
  );
}
