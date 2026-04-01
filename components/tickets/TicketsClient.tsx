"use client";

import { useState } from "react";
import TicketFilters, { type FilterOption } from "@/components/tickets/TicketFilters";
import TicketTable from "@/components/tickets/TicketTable";
import CustomerTicketView from "@/components/tickets/CustomerTicketView";
import { 
  StatusBadge, 
  SlaBadge, 
  type Ticket, 
  type TicketStatus, 
  type TicketPriority, 
  type SlaStatus 
} from "@/components/tickets/TicketBadges";

interface TicketsClientProps {
  role: "admin" | "sales_agent" | "customer";
  ticketsData: any[] | null;
  companyEmployees?: any[];
  companyId?: string;
  currentUserId?: string;
}

/** Compute a simple SLA label based on creation date and current status */
function computeSla(createdAt: string, status: string): SlaStatus {
  if (status === "Resolved" || status === "Resolved") return "On track";
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  if (ageHours > 48) return "Overdue";
  if (ageHours > 24) return "At risk";
  return "On track";
}

export default function TicketsClient({ 
  role, 
  ticketsData, 
  companyEmployees = [], 
  companyId, 
  currentUserId 
}: TicketsClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All Tickets");
  const [activePriority, setActivePriority] = useState<TicketPriority | "All Priorities">("All Priorities");
  const [activeSla, setActiveSla] = useState<SlaStatus | "All SLA">("All SLA");
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);

  // Map DB tickets to UI format
  const dbTickets: Ticket[] = (ticketsData || []).map((t) => {
    const statusMap: Record<string, TicketStatus> = {
      open: "Open",
      in_progress: "Pending",
      on_hold: "Pending",
      resolved: "Resolved",
      closed: "Resolved",
    };
    const priorityMap: Record<string, TicketPriority> = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Urgent",
    };
    const status = statusMap[t.status] || "Open";
    const agentName = t.assigned_agent?.full_name ?? "Unassigned";
    const agentInitials = agentName !== "Unassigned" 
      ? agentName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
      : "U";

    return {
      id: `#${t.id.slice(0, 8).toUpperCase()}`,
      subject: t.title,
      description: t.description || "",
      customer: t.customer?.full_name || t.client_id || "Unknown Customer",
      createdAt: new Date(t.created_at).toLocaleDateString(),
      status,
      priority: priorityMap[t.priority] || "Low",
      sla: computeSla(t.created_at, status),
      agent: agentName,
      agentId: t.assigned_to,
      agentInitials,
      rawId: t.id,
    };
  });

  // ── Customer view ──────────────────────────────────────────────────────────
  if (role === "customer") {
    return (
      <CustomerTicketView
        tickets={dbTickets}
        rawTickets={ticketsData}
        companyId={companyId ?? ""}
        currentUserId={currentUserId ?? ""}
      />
    );
  }

  // ── Summary Stats calculation ──────────────────────────────────────────────
  const totalOpen = dbTickets.filter(t => t.status === "Open").length;
  const totalPending = dbTickets.filter(t => t.status === "Pending").length;
  const totalOverdue = dbTickets.filter(t => t.sla === "Overdue").length;
  
  const resolvedTickets = (ticketsData || []).filter(t => t.status === 'resolved' || t.status === 'closed');
  let avgResponse = "0h";
  if (resolvedTickets.length > 0) {
    const totalMs = resolvedTickets.reduce((acc, t) => {
      const created = new Date(t.created_at).getTime();
      const resolved = new Date(t.resolved_at || t.updated_at).getTime();
      return acc + (resolved - created);
    }, 0);
    const avgHrs = (totalMs / resolvedTickets.length) / (1000 * 60 * 60);
    avgResponse = avgHrs < 1 ? "<1h" : `${avgHrs.toFixed(1)}h`;
  }

  const STATS = [
    { label: "Total Open",   value: totalOpen.toString(),      icon: "inbox",   color: "text-indigo-600 dark:text-indigo-400",   bg: "bg-indigo-50 dark:bg-indigo-900/30" },
    { label: "Overdue",      value: totalOverdue.toString(),   icon: "alarm",   color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-900/30" },
    { label: "Pending",      value: totalPending.toString(),   icon: "pending", color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-900/30" },
    { label: "Avg Response", value: avgResponse,               icon: "timer",   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  ];

  // ── Admin / agent view ─────────────────────────────────────────────────────
  const filteredTickets = dbTickets.filter((ticket) => {
    const statusMatch = activeFilter === "All Tickets" || ticket.status === activeFilter;
    const priorityMatch = activePriority === "All Priorities" || ticket.priority === activePriority;
    const slaMatch = activeSla === "All SLA" || ticket.sla === activeSla;
    return statusMatch && priorityMatch && slaMatch;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* ── Summary Stats ── */}
      {role === 'admin' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon, color, bg }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm"
            >
              <div className={`size-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Agent Workload ── */}
      {role === 'admin' && companyEmployees.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Agent Workload</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {companyEmployees.map((worker) => {
              const workerTickets = dbTickets.filter((t) => (ticketsData?.find(rt => rt.id === t.rawId)?.assigned_to === worker.id));
              const open    = workerTickets.filter((t) => t.status === "Open").length;
              const pending = workerTickets.filter((t) => t.status === "Pending").length;
              const overdue = workerTickets.filter((t) => t.sla === "Overdue").length;
              const isExpanded = expandedWorker === worker.id;
              const initials = worker.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

              return (
                <div
                  key={worker.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  <div className="p-5 flex items-start gap-4">
                    <div className="size-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{worker.full_name}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{worker.role.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="px-5 pb-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-center">
                      <p className="text-base font-black text-blue-700 dark:text-blue-300">{open}</p>
                      <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">Open</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-center">
                      <p className="text-base font-black text-amber-700 dark:text-amber-300">{pending}</p>
                      <p className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">Pending</p>
                    </div>
                    <div className={`rounded-lg px-3 py-2 text-center ${overdue > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"}`}>
                      <p className={`text-base font-black ${overdue > 0 ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>{overdue}</p>
                      <p className={`text-[10px] font-medium ${overdue > 0 ? "text-red-500 dark:text-red-400" : "text-emerald-500 dark:text-emerald-400"}`}>Overdue</p>
                    </div>
                  </div>

                  {workerTickets.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setExpandedWorker(isExpanded ? null : worker.id)}
                        className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <span>{workerTickets.length} assigned tickets</span>
                        <span className={`material-symbols-outlined text-base transition-transform ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                      </button>
                      {isExpanded && (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                          {workerTickets.map((ticket) => (
                            <li key={ticket.id}>
                              <div className="w-full px-5 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{ticket.subject}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{ticket.id} · {ticket.createdAt}</p>
                                </div>
                                <StatusBadge status={ticket.status} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Filters & Table ── */}
      <div>
        <TicketFilters
          active={activeFilter}
          onFilterChange={setActiveFilter}
          activePriority={activePriority}
          onPriorityChange={setActivePriority}
          activeSla={activeSla}
          onSlaChange={setActiveSla}
          tickets={dbTickets}
          role={role}
        />

        <div className="mt-6">
          <TicketTable
            tickets={filteredTickets}
            rawTickets={ticketsData ?? []}
            total={filteredTickets.length}
            page={1}
            pageCount={1}
            role={role}
          />
        </div>
      </div>
    </div>
  );
}
