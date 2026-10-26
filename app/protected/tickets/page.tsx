import { createClient, createAdminClient } from "@/lib/supabase/server";
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
  let role: "admin" | "sales_agent" = "admin";
  let actualRole: string | undefined;
  let companyId = "";

  const adminClient = createAdminClient();

  if (user) {
    const { data: employee } = await adminClient
      .from("employees")
      .select("role, company_id")
      .eq("id", user.id)
      .maybeSingle();

    actualRole = employee?.role;

    if (
      employee?.role === "superadmin" ||
      employee?.role === "admin" ||
      employee?.role === "server_admin"
    ) {
      role = "admin";
    } else {
      role = "sales_agent";
    }

    companyId = employee?.company_id ?? "";
  }

  // Fetch all employees for the company (using admin client to prevent RLS hiding colleagues from dev/agents)
  let employees: any[] = [];
  if (companyId) {
    const { data: empData } = await adminClient
      .from("employees")
      .select("id, full_name, role, email_address")
      .eq("company_id", companyId);
    employees = empData ?? [];
  } else if (actualRole === "superadmin") {
    const { data: empData } = await adminClient
      .from("employees")
      .select("id, full_name, role, email_address")
      .neq("role", "client");
    employees = empData ?? [];
  }

  // Fetch tickets with reliable server query
  let ticketsQuery = adminClient
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (companyId) {
    ticketsQuery = ticketsQuery.eq("company_id", companyId);
  }

  const { data: rawTicketsData, error: ticketError } = await ticketsQuery;
  if (ticketError) {
    console.error("[TicketsPage] Error fetching tickets:", ticketError);
  }

  // Fetch customers to resolve client_id
  let customers: any[] = [];
  if (companyId) {
    const { data: custData } = await adminClient
      .from("customers")
      .select("id, full_name")
      .eq("company_id", companyId);
    customers = custData ?? [];
  }

  // Map joined customer and assigned_agent safely
  const ticketsData = (rawTicketsData ?? []).map((t: any) => {
    const assignedAgent = employees.find((e) => e.id === t.assigned_to) ?? null;
    const customerObj =
      customers.find((c) => c.id === t.client_id) ||
      employees.find((e) => e.id === t.client_id) ||
      null;

    return {
      ...t,
      assigned_agent: assignedAgent
        ? { id: assignedAgent.id, full_name: assignedAgent.full_name, role: assignedAgent.role }
        : null,
      customer: customerObj ? { full_name: customerObj.full_name } : null,
    };
  });

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black leading-tight tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Track and manage active customer support requests
          </p>
        </div>
      </div>

      {/* Tickets Client side logic */}
      <TicketsClient
        role={role}
        actualRole={actualRole}
        ticketsData={ticketsData}
        companyEmployees={employees}
        companyId={companyId}
        currentUserId={user?.id}
      />
    </>
  );
}
