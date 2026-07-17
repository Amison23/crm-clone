"use client";

import { useState } from "react";
import { TrendingUp, Timer, CheckCircle2, MoreVertical, Briefcase } from "lucide-react";

export default function AgentManagementClient({
  employees,
  ticketsData,
}: {
  employees: any[];
  ticketsData: any[];
}) {
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);

  // Status Badge Helper
  const StatusBadge = ({ status }: { status: string }) => {
    const s = status?.toLowerCase() || "open";
    if (s === "resolved" || s === "closed")
      return (
        <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Resolved
        </span>
      );
    if (s === "pending")
      return (
        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200/50 dark:border-amber-800/50">
          Pending
        </span>
      );
    return (
      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-200/50 dark:border-blue-800/50">
        Open
      </span>
    );
  };

  return (
    <div className="space-y-8 mt-10 border-t border-slate-200 dark:border-slate-800 pt-10">
      <div>
        <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Briefcase className="text-primary" size={24} />
          Agent Assignment & Workload
        </h2>
        <p className="text-sm text-slate-500 mb-6">Assign company products, manage roles, and monitor ticket workload across your team.</p>
      </div>

      {/* ── Intelligence Metrics (Admin Overview) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-8">
        {/* ── Workload Allocation ── */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-[200px] flex flex-col justify-between group">
          <div>
            <div className="p-3 bg-primary/10 text-primary rounded-2xl mb-4 w-fit"><TrendingUp size={20} /></div>
            <p className="text-xl font-bold text-slate-900 dark:text-white tracking-[-0.02em]">Node-Driven</p>
            <p className="text-2xl font-bold text-primary tracking-[-0.02em]">78%</p>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.1em]">Current Allocation</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Node-Based Routing</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">Status</p>
              <div className="text-xs font-bold tracking-wider text-emerald-500">
                Optimal
              </div>
            </div>
          </div>
        </div>

        {/* ── Queue Depth ── */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-[200px] flex flex-col justify-between">
          <div>
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl mb-4 w-fit"><Timer size={20} /></div>
            <p className="text-xl font-bold text-slate-900 dark:text-white tracking-[-0.02em]">Queue Depth</p>
            <p className="text-2xl font-bold text-amber-500 tracking-[-0.02em]">6</p>
          </div>
          <div className="text-right mt-auto">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.1em]">Backlog Size</p>
            <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
              6 items
            </p>
          </div>
        </div>

        {/* ── SLA Compliance ── */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-[200px] flex flex-col justify-between">
          <div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-4 w-fit"><CheckCircle2 size={20} /></div>
            <p className="text-xl font-bold text-slate-900 dark:text-white tracking-[-0.02em]">SLA Health</p>
            <p className="text-2xl font-bold text-emerald-500 tracking-[-0.02em]">92%</p>
          </div>
          <div className="text-right mt-auto">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.1em]">Target</p>
            <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
              92% vs 95%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {employees.map((worker) => {
          const workerTickets = ticketsData.filter(
            (t) => t.assigned_to === worker.id || t.assigned_agent?.id === worker.id
          );
          
          const open = workerTickets.filter((t) => t.status?.toLowerCase() === "open").length;
          const pending = workerTickets.filter((t) => t.status?.toLowerCase() === "pending" || t.status?.toLowerCase() === "in_progress").length;
          // Simple mock for overdue, since tickets might not have SLA fields directly
          const overdue = workerTickets.filter((t) => t.priority === "high" && t.status?.toLowerCase() === "open").length;
          
          const isExpanded = expandedWorker === worker.id;
          const initials = worker.full_name
            ?.split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase() || "A";

          return (
            <div
              key={worker.id}
              className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 flex items-start gap-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                <div className="size-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-inner">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                      {worker.full_name}
                    </p>
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                       {worker.role.replace("_", " ")}
                     </span>
                     <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wider">
                       Active
                     </span>
                  </div>
                </div>
              </div>

              {/* Assignment Controls */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em] mb-3">Product Assignment</p>
                 <select className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
                    <option value="">Unassigned</option>
                    <option value="cloud-crm">Cloud CRM Solutions</option>
                    <option value="erp-sync">Enterprise ERP Sync</option>
                    <option value="support-tier-1">Tier 1 Support</option>
                 </select>
              </div>

              <div className="p-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-3 py-3 text-center border border-blue-100/50 dark:border-blue-800/30">
                  <p className="text-xl font-black text-blue-700 dark:text-blue-300">
                    {open}
                  </p>
                  <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider mt-1">
                    Open
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 px-3 py-3 text-center border border-amber-100/50 dark:border-amber-800/30">
                  <p className="text-xl font-black text-amber-700 dark:text-amber-300">
                    {pending}
                  </p>
                  <p className="text-[10px] text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wider mt-1">
                    Pending
                  </p>
                </div>
                <div
                  className={`rounded-2xl px-3 py-3 text-center border ${
                    overdue > 0
                      ? "bg-red-50 dark:bg-red-900/20 border-red-100/50 dark:border-red-800/30"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50"
                  }`}
                >
                  <p
                    className={`text-xl font-black ${
                      overdue > 0
                        ? "text-red-700 dark:text-red-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {overdue}
                  </p>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${
                      overdue > 0
                        ? "text-red-500 dark:text-red-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Overdue
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => setExpandedWorker(isExpanded ? null : worker.id)}
                  className={`w-full flex items-center justify-between px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                     isExpanded 
                     ? "bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-white" 
                     : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{workerTickets.length} Active Tickets</span>
                  <span
                    className={`material-symbols-outlined text-lg transition-transform duration-300 ${
                      isExpanded ? "rotate-180 text-primary" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isExpanded && workerTickets.length > 0 && (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
                    {workerTickets.map((ticket) => (
                      <li key={ticket.id}>
                        <div className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-white dark:hover:bg-slate-800 transition-colors text-left group">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                              {ticket.title || ticket.subject}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
                              {new Date(ticket.created_at || ticket.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <StatusBadge status={ticket.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {isExpanded && workerTickets.length === 0 && (
                  <div className="p-6 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
                    <p className="text-xs text-slate-400 font-medium">No active tickets assigned.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
