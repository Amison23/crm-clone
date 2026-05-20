import { createClient } from "@/lib/supabase/server";
import TicketsClient from "@/components/tickets/TicketsClient";

export default async function TicketsPage() {
  const supabase = await createClient();

  // Get the current user's session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the user's role and company from the employees table
  let role: "admin" | "sales_agent" | "customer" = "admin";
  let companyId = "261b9e2d-1351-4733-b760-f0966f44d55a";

  if (user) {
    const { data: employee } = await supabase
      .from("employees")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (employee?.role === "super_admin" || employee?.role === "admin") {
      role = "admin";
    } else if (employee?.role === "sales_agent") {
      role = "sales_agent";
    } else {
      role = "customer";
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

  if (role === "customer" && user) {
    // Clients only see their own tickets
    ticketsQuery = ticketsQuery.eq("client_id", user.id);
  } else if (companyId) {
    // Admins & agents only see their company's tickets
    ticketsQuery = ticketsQuery.eq("company_id", companyId);
  }

  const { data: ticketsData } = await ticketsQuery;

  // --- MOCK DATA FALLBACK FOR SALES AGENTS ---
  const finalTicketsData = (ticketsData && ticketsData.length > 0) ? ticketsData : [
    {
      id: "721a8b9c-1d2e-3f4g-5h6i-7j8k9l0m1n2o",
      title: "Unable to process payment for subscription",
      description: "Client is getting a 'Card Declined' error even though the card is valid.",
      status: "open",
      priority: "high",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      company_id: companyId,
      assigned_to: user?.id,
      assigned_agent: { id: user?.id, full_name: user?.user_metadata?.full_name || "Sales Agent", role: "sales_agent" },
      customer: { full_name: "James Smith" }
    },
    {
      id: "832b9c0d-2e3f-4g5h-6i7j-8k9l0m1n2o3p",
      title: "Reset password link not working",
      description: "The link expires too quickly or doesn't load at all.",
      status: "in_progress",
      priority: "medium",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      company_id: companyId,
      assigned_to: user?.id,
      assigned_agent: { id: user?.id, full_name: user?.user_metadata?.full_name || "Sales Agent", role: "sales_agent" },
      customer: { full_name: "Sarah Johnson" }
    },
    {
      id: "943c0d1e-3f4g-5h6i-7j8k-9l0m1n2o3p4q",
      title: "Query about enterprise pricing",
      description: "Wants to know if there's a discount for 100+ users.",
      status: "open",
      priority: "low",
      created_at: new Date(Date.now() - 10800000).toISOString(),
      company_id: companyId,
      assigned_to: user?.id,
      assigned_agent: { id: user?.id, full_name: user?.user_metadata?.full_name || "Sales Agent", role: "sales_agent" },
      customer: { full_name: "Michael Chen" }
    },
    {
      id: "054d1e2f-4g5h-6i7j-8k9l-0m1n2o3p4q5r",
      title: "Feature Request: Dashboard Customization",
      description: "Needs to be able to drag and drop widgets on the main screen.",
      status: "resolved",
      priority: "medium",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      company_id: companyId,
      assigned_to: user?.id,
      assigned_agent: { id: user?.id, full_name: user?.user_metadata?.full_name || "Sales Agent", role: "sales_agent" },
      customer: { full_name: "Elena Rodriguez" }
    }
  ];

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
        ticketsData={finalTicketsData}
        companyEmployees={employees}
        companyId={companyId}
        currentUserId={user?.id}
      />
    </>
  );
}
