import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  Headset,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default async function SalesAgentPage() {
  const supabase = await createClient();

  // 1. Identity Verification
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const agentId = user.id;

  // Fetch employee record to get clean name and company ID
  const { data: employee } = await supabase
    .from("employees")
    .select("full_name, company_id, role")
    .eq("id", agentId)
    .single();

  const agentName = employee?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Sales Agent";
  const firstName = agentName.split(" ")[0];

  // 2. Parallel Data Fetching (Strictly Agent-Scoped)
  const [tasksReq, ticketsReq, leadsReq] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", agentId)
      .order("due_date", { ascending: true }),
    supabase
      .from("tickets")
      .select("*")
      .eq("assigned_to", agentId)
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("*")
      .eq("employee_id", agentId)
      .order("created_at", { ascending: false }),
  ]);

  const tasks = tasksReq.data || [];
  const tickets = ticketsReq.data || [];
  const leads = leadsReq.data || [];

  // Metrics Math
  const activeLeads = leads.filter((l) => l.status !== "won" && l.status !== "lost");
  const wonLeads = leads.filter((l) => l.status === "won").length;
  const totalClosedLeads = leads.filter((l) => l.status === "won" || l.status === "lost").length;
  const winRate = totalClosedLeads > 0 ? Math.round((wonLeads / totalClosedLeads) * 100) : 0;

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasksCount = tasks.filter((t) => t.status === "completed").length;

  const openTickets = tickets.filter((t) => t.status !== "closed" && t.status !== "resolved");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* ── HEADER ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {today}
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {greeting}, {firstName}!
          </h1>
          <div className="flex items-center gap-2 pt-1">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">
              Sales Agent Workspace · Active Session
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/protected/crm-leads-table"
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <Users className="size-4 text-indigo-500" />
            CRM Pipeline
          </Link>
          <Link
            href="/protected/task-management-board"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <CheckSquare className="size-4" />
            Task Board
          </Link>
        </div>
      </header>

      {/* ── QUICK VITALS STATS ROW ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Assigned Leads
            </span>
            <Users className="size-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{leads.length}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{activeLeads.length} Active</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Pending Tasks
            </span>
            <CheckSquare className="size-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{pendingTasks.length}</span>
            <span className="text-xs font-bold text-slate-400">{completedTasksCount} Completed</span>
          </div>
        </div>

        {/* Open Support Tickets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Open Tickets
            </span>
            <Headset className="size-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{openTickets.length}</span>
            <span className="text-xs font-bold text-rose-500">{openTickets.length > 0 ? "Requires Action" : "All Clear"}</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Win Rate
            </span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{winRate}%</span>
            <span className="text-xs font-bold text-emerald-500">{wonLeads} Deals Won</span>
          </div>
        </div>
      </section>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ASSIGNED TASKS & TICKETS (8 COLS) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* MY ASSIGNED TASKS TABLE CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <CheckSquare className="size-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">My Actionable Tasks</h3>
                  <p className="text-xs text-slate-400 font-medium">Tasks assigned directly to your queue</p>
                </div>
              </div>

              <Link
                href="/protected/task-management-board"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Task Board <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Task Details</th>
                    <th className="p-3.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Priority</th>
                    <th className="p-3.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Due Date</th>
                    <th className="p-3.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                        No assigned tasks in your queue.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
                          {task.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{task.description}</p>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              task.priority === "high" || task.priority === "critical"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                                : task.priority === "medium"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 font-medium">
                          {task.due_date ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3.5 text-slate-400" />
                              {new Date(task.due_date).toLocaleDateString("en-GB")}
                            </span>
                          ) : (
                            "No due date"
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 font-bold capitalize ${
                              task.status === "completed"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : task.status === "in_progress"
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {task.status === "completed" ? (
                              <CheckCircle2 className="size-3.5" />
                            ) : (
                              <Clock className="size-3.5" />
                            )}
                            {task.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MY OPEN SUPPORT TICKETS */}
          {tickets.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <Headset className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">Assigned Support Tickets</h3>
                    <p className="text-xs text-slate-400 font-medium">Incidents assigned to you</p>
                  </div>
                </div>

                <Link
                  href="/protected/tickets"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Support Desk <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 hover:border-slate-200 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{ticket.title}</p>
                      <p className="text-[10px] text-slate-400">Created: {new Date(ticket.created_at).toLocaleDateString("en-GB")}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        ticket.status === "closed" || ticket.status === "resolved"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE LEADS PIPELINE (4 COLS) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Active Pipeline</h3>
                  <p className="text-xs text-slate-400 font-medium">Assigned leads</p>
                </div>
              </div>

              <Link
                href="/protected/crm-leads-table"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                All Leads <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {activeLeads.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No active leads assigned to you.</p>
              ) : (
                activeLeads.slice(0, 8).map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {lead.company_name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "Lead"}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{lead.email || lead.phone || "No contact info"}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded-md shrink-0">
                      {lead.status || "new"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}