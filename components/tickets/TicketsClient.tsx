"use client";

import { useState } from "react";
import TicketFilters, { type FilterOption } from "@/components/tickets/TicketFilters";
import TicketTable from "@/components/tickets/TicketTable";
import NewTicketForm from "@/components/tickets/NewTicketForm";
import { 
  StatusBadge, 
  SlaBadge, 
  type Ticket, 
  type TicketStatus, 
  type TicketPriority, 
  type SlaStatus 
} from "@/components/tickets/TicketBadges";

interface TicketsClientProps {
  role: "admin" | "sales_agent";
  actualRole?: string;
  ticketsData: any[] | null;
  companyEmployees?: any[];
  companyId?: string;
  currentUserId?: string;
}

/** Compute a simple SLA label based on creation date and current status */
function computeSla(createdAt: string, status: string): SlaStatus {
  if (status === "Resolved") return "Complete";
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  if (ageHours > 48) return "Overdue";
  if (ageHours > 24) return "At risk";
  return "On track";
}

export default function TicketsClient({ 
  role,
  actualRole,
  ticketsData, 
  companyEmployees = [], 
  companyId, 
  currentUserId 
}: TicketsClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All Tickets");
  const [activePriority, setActivePriority] = useState<TicketPriority | "All Priorities">("All Priorities");
  const [activeSla, setActiveSla] = useState<SlaStatus | "All SLA">("All SLA");
  
  const [activeTab, setActiveTab] = useState<"external" | "internal">(
    actualRole === "dev" ? "internal" : "external"
  );
  const [isRaisingConcern, setIsRaisingConcern] = useState(false);

  const handleExportCSV = () => {
    const listToExport = ticketsData || [];
    if (listToExport.length === 0) return;
    const headers = ["ID", "Title", "Status", "Priority", "Created At"];
    const rows = listToExport.map((t: any) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority || 'medium',
      new Date(t.created_at).toLocaleDateString("en-GB")
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tickets_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

    // Determine the requester's actual role: look up client_id in employees list first
    const requesterEmployee = t.client_id
      ? companyEmployees.find((e: any) => e.id === t.client_id)
      : null;
    const clientRole: string = requesterEmployee?.role || (t.ticket_type === 'internal' ? 'employee' : 'customer');

    return {
      id: `#${t.id.slice(0, 8).toUpperCase()}`,
      subject: t.title,
      description: t.description || "",
      customer: t.customer?.full_name || t.client_id || "Unknown",
      clientRole,
      createdAt: new Date(t.created_at).toISOString().split('T')[0],
      status,
      priority: priorityMap[t.priority] || "Low",
      sla: computeSla(t.created_at, status),
      agent: agentName,
      agentId: t.assigned_to,
      agentInitials,
      rawId: t.id,
      ticketType: t.ticket_type || "external",
      clientId: t.client_id,
    };
  });



  // ── Summary Stats calculation (based on external/customer tickets only) ──────
  const externalTickets = dbTickets.filter(t => t.ticketType === "external");
  const totalOpen = externalTickets.filter(t => t.status === "Open").length;
  const totalPending = externalTickets.filter(t => t.status === "Pending").length;
  const totalOverdue = externalTickets.filter(t => t.sla === "Overdue").length;
  
  const resolvedTickets = (ticketsData || []).filter(t =>
    (t.status === 'resolved' || t.status === 'closed') && (!t.ticket_type || t.ticket_type === 'external')
  );
  let avgResponse = "0h";
  if (resolvedTickets.length > 0) {
    const totalMs = resolvedTickets.reduce((acc: number, t: any) => {
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

  // Counts for tab badges
  const externalCount = externalTickets.length;
  const internalCount = dbTickets.filter((t) => {
    if (t.ticketType !== "internal") return false;
    if (actualRole === "server_admin" || actualRole === "admin" || actualRole === "superadmin") return true;
    return t.clientId === currentUserId || t.agentId === currentUserId;
  }).length;

  // ── Admin / agent / dev view ───────────────────────────────────────────────
  // First, filter by tab and role visibility
  const visibleTickets = dbTickets.filter((ticket) => {
    if (activeTab === "external") {
      return ticket.ticketType === "external";
    } else {
      if (ticket.ticketType !== "internal") return false;
      // Server admins, admins, and superadmins see all internal concerns
      if (actualRole === "server_admin" || actualRole === "admin" || actualRole === "superadmin") return true;
      // Dev and agents see concerns they commissioned (clientId) OR were assigned to (agentId)
      return ticket.clientId === currentUserId || ticket.agentId === currentUserId;
    }
  });

  // Then apply UI filters
  const filteredTickets = visibleTickets.filter((ticket) => {
    const statusMatch = activeFilter === "All Tickets" || ticket.status === activeFilter;
    const priorityMatch = activePriority === "All Priorities" || ticket.priority === activePriority;
    const slaMatch = activeSla === "All SLA" || ticket.sla === activeSla;
    return statusMatch && priorityMatch && slaMatch;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* ── Tabs ── */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("external")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "external"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <span>Customer Tickets</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
            {externalCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("internal")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "internal"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <span>Internal Concerns</span>
          <span className="material-symbols-outlined text-[16px] text-amber-500">lock</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold">
            {internalCount}
          </span>
        </button>
      </div>

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


      {/* ── Filters & Table ── */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {activeTab === "external" ? "Ticket Queue" : "Internal Concerns Queue"}
          </h2>
           <div className="flex items-center gap-3">
            {actualRole !== "server_admin" && (
              <button
                onClick={() => setIsRaisingConcern(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Raise Concern
              </button>
            )}
            {(role as string) !== "client" && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-base">ios_share</span>
                Export CSV
              </button>
            )}
          </div>
        </div>

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
            actualRole={actualRole}
          />
        </div>
      </div>

      {isRaisingConcern && companyId && (
        <NewTicketForm
          companyId={companyId}
          ticketType="internal"
          onSuccess={() => {
            setIsRaisingConcern(false);
            window.location.reload();
          }}
          onCancel={() => setIsRaisingConcern(false)}
        />
      )}
    </div>
  );
}
