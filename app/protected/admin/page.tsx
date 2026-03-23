"use client";
import { useState } from "react";
import {
  StatusBadge,
  PriorityBadge,
  SlaBadge,
  type Ticket,
  type TicketStatus,
  MOCK_WORKERS,
} from "@/components/tickets/TicketBadges";
import { TicketModal } from "@/components/tickets/TicketTable";

// ─── Mock data ─────────────────────────────────────────────────────────────── 

const ASSIGNED_TICKETS: (Ticket & { workerId: string })[] = [
  { workerId: "w1", id: "#TK-1024", subject: "Login issue on mobile app",    description: "User is unable to login to the mobile app",                     customer: "Alice Cooper",  createdAt: "2h ago",  status: "Open",    priority: "Urgent", sla: "Overdue",  agent: "John Doe" },
  { workerId: "w1", id: "#TK-1031", subject: "Password reset not working",   description: "Reset email is not being sent to the user",                    customer: "Tom Hardy",     createdAt: "5h ago",  status: "Pending", priority: "High",   sla: "At risk",  agent: "John Doe" },
  { workerId: "w1", id: "#TK-1037", subject: "Slow dashboard load",          description: "Dashboard takes more than 10 seconds to load",                 customer: "Nina Simone",   createdAt: "1d ago",  status: "Open",    priority: "Medium", sla: "On track", agent: "John Doe" },
  { workerId: "w2", id: "#TK-1025", subject: "Payment gateway timeout",      description: "User is unable to make payments through the payment gateway",   customer: "Bob Marley",    createdAt: "4h ago",  status: "Pending", priority: "High",   sla: "At risk",  agent: "Jane Smith" },
  { workerId: "w2", id: "#TK-1028", subject: "Invoice not generated",        description: "Invoice PDF is blank after download",                          customer: "Lisa Park",     createdAt: "6h ago",  status: "Open",    priority: "High",   sla: "Overdue",  agent: "Jane Smith" },
  { workerId: "w3", id: "#TK-1029", subject: "Export to CSV broken",         description: "Exported file contains no data",                               customer: "Omar Sharp",    createdAt: "2d ago",  status: "Pending", priority: "Low",    sla: "On track", agent: "Mike Ross" },
  { workerId: "w4", id: "#TK-1027", subject: "Feature request: Dark mode",   description: "User is requesting a dark mode feature",                       customer: "Diana Prince",  createdAt: "2d ago",  status: "Open",    priority: "Medium", sla: "On track", agent: "Sarah Connor" },
  { workerId: "w4", id: "#TK-1033", subject: "Webhook delivery failing",     description: "Webhooks to partner service not reaching destination",         customer: "Lex Luthor",    createdAt: "3h ago",  status: "Open",    priority: "Urgent", sla: "Overdue",  agent: "Sarah Connor" },
  { workerId: "w4", id: "#TK-1034", subject: "2FA setup screen blank",       description: "The 2FA setup page shows a white screen on mobile",            customer: "Bruce Wayne",   createdAt: "1d ago",  status: "Open",    priority: "High",   sla: "At risk",  agent: "Sarah Connor" },
  { workerId: "w5", id: "#TK-1030", subject: "Profile picture upload fails", description: "Images over 1MB fail silently during upload",                  customer: "Carla Diaz",    createdAt: "8h ago",  status: "Pending", priority: "Medium", sla: "On track", agent: "Ali Hassan" },
];

// ─── Summary stats ────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Open",     value: "8",   icon: "inbox",       color: "text-indigo-600 dark:text-indigo-400",   bg: "bg-indigo-50 dark:bg-indigo-900/30" },
  { label: "Overdue",        value: "3",   icon: "alarm",       color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-900/30" },
  { label: "Pending",        value: "4",   icon: "pending",     color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-900/30" },
  { label: "Avg Response",   value: "1.4h",icon: "timer",       color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
];

export default function AdminPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [openModal, setOpenModal]           = useState(false);
  const [, setStatus]                      = useState<TicketStatus>("Open");
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black leading-tight tracking-tight">Admin Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 text-base">
          Monitor agent workloads, ticket assignments, and response performance
        </p>
      </div>

      {/* ── Summary Stats ── */}
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

      {/* ── Agent Workload Section ── */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Agent Workload</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {MOCK_WORKERS.map((worker) => {
            const workerTickets = ASSIGNED_TICKETS.filter((t) => t.workerId === worker.id);
            const open    = workerTickets.filter((t) => t.status === "Open").length;
            const pending = workerTickets.filter((t) => t.status === "Pending").length;
            const overdue = workerTickets.filter((t) => t.sla === "Overdue").length;
            const isExpanded = expandedWorker === worker.id;

            return (
              <div
                key={worker.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div className="p-5 flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="size-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                      {worker.initials}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white dark:border-slate-900 ${
                        worker.isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{worker.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        worker.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                      }`}>
                        {worker.isActive ? "Active" : "Idle"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{worker.role}</p>
                  </div>
                </div>

                {/* Stat chips */}
                <div className="px-5 pb-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-center">
                    <p className="text-base font-black text-blue-700 dark:text-blue-300">{open}</p>
                    <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">Open</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-center">
                    <p className="text-base font-black text-amber-700 dark:text-amber-300">{pending}</p>
                    <p className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">Pending</p>
                  </div>
                  <div className={`rounded-lg px-3 py-2 text-center ${
                    overdue > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"
                  }`}>
                    <p className={`text-base font-black ${overdue > 0 ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>{overdue}</p>
                    <p className={`text-[10px] font-medium ${overdue > 0 ? "text-red-500 dark:text-red-400" : "text-emerald-500 dark:text-emerald-400"}`}>Overdue</p>
                  </div>
                </div>

                {/* Expandable ticket list */}
                {workerTickets.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setExpandedWorker(isExpanded ? null : worker.id)}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <span>{workerTickets.length} assigned ticket{workerTickets.length !== 1 ? "s" : ""}</span>
                      <span className={`material-symbols-outlined text-base transition-transform ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                    </button>

                    {isExpanded && (
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {workerTickets.map((ticket) => (
                          <li key={ticket.id}>
                            <button
                              onClick={() => { setSelectedTicket(ticket); setOpenModal(true); }}
                              className="w-full px-5 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{ticket.subject}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{ticket.id} · {ticket.createdAt}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <StatusBadge status={ticket.status} />
                                <SlaBadge sla={ticket.sla} />
                              </div>
                            </button>
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

      {/* ── All Assigned Tickets Table ── */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">All Active Assignments</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  {["Ticket", "Agent", "Status", "Priority", "SLA", "Opened"].map((col) => (
                    <th key={col} className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ASSIGNED_TICKETS.map((ticket) => {
                  const worker = MOCK_WORKERS.find((w) => w.id === ticket.workerId);
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => { setSelectedTicket(ticket); setOpenModal(true); }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-400">{ticket.id}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">{ticket.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {worker?.initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{ticket.agent}</p>
                            <div className="flex items-center gap-1">
                              <span className={`size-1.5 rounded-full ${worker?.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                              <span className="text-[10px] text-slate-400">{worker?.isActive ? "Active" : "Idle"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                      <td className="px-6 py-4"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-6 py-4"><SlaBadge sla={ticket.sla} /></td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{ticket.createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ticket detail modal (reused from tickets page) */}
      {selectedTicket && (
        <TicketModal
          openModal={openModal}
          selectedTicket={selectedTicket}
          setOpenModal={setOpenModal}
          onStatusChange={setStatus}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}