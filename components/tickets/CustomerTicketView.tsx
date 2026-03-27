"use client";

import { useState } from "react";
import { StatusBadge, PriorityBadge, type Ticket, type TicketStatus, type TicketPriority } from "./TicketBadges";
import NewTicketForm from "./NewTicketForm";
import CustomerTicketModal from "./CustomerTicketModal";

const QUICK_ISSUES = [
  { value: "billing",   label: "Billing & Payments",  icon: "payments",         description: "Invoice, charges, refunds" },
  { value: "technical", label: "Technical Issue",      icon: "build",            description: "Bugs, errors, outages" },
  { value: "account",   label: "Account Access",       icon: "manage_accounts",  description: "Login, password, permissions" },
  { value: "product",   label: "Product Question",     icon: "help",             description: "How-to and usage questions" },
  { value: "feature",   label: "Feature Request",      icon: "lightbulb",        description: "Suggest improvements" },
  { value: "other",     label: "Other",                icon: "category",         description: "Something else" },
];

const STATUS_COLORS: Record<TicketStatus, { pill: string; dot: string }> = {
  Open:     { pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",         dot: "bg-blue-500" },
  Pending:  { pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",     dot: "bg-amber-500" },
  Resolved: { pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", dot: "bg-emerald-500" },
};

interface CustomerTicketViewProps {
  tickets: Ticket[];
  /** Raw DB tickets (with uuid IDs) — needed to open modals */
  rawTickets: any[] | null;
  companyId: string;
  currentUserId: string;
}

export default function CustomerTicketView({
  tickets,
  rawTickets,
  companyId,
  currentUserId,
}: CustomerTicketViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<string | undefined>();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTicketDbId, setSelectedTicketDbId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "All">("All");
  const [refreshKey, setRefreshKey] = useState(0);

  function openForm(category?: string) {
    setPreselectedCategory(category);
    setShowForm(true);
  }

  function handleTicketSuccess() {
    setShowForm(false);
    // Trigger a page refresh to pull new data — in a real app this would use router.refresh()
    setRefreshKey((k) => k + 1);
  }

  function openTicket(ticket: Ticket) {
    // Find the raw DB record to get the UUID
    const raw = rawTickets?.find((r) => `#${r.id.slice(0, 8).toUpperCase()}` === ticket.id);
    setSelectedTicket(ticket);
    setSelectedTicketDbId(raw?.id ?? "");
  }

  const filtered =
    filterStatus === "All"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  const counts: Record<TicketStatus, number> = {
    Open:     tickets.filter((t) => t.status === "Open").length,
    Pending:  tickets.filter((t) => t.status === "Pending").length,
    Resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  return (
    <>
      {/* ── New ticket form ── */}
      {showForm && (
        <NewTicketForm
          key={refreshKey}
          companyId={companyId}
          onSuccess={handleTicketSuccess}
          onCancel={() => setShowForm(false)}
          preselectedCategory={preselectedCategory}
        />
      )}

      {/* ── Ticket detail modal ── */}
      {selectedTicket && selectedTicketDbId && (
        <CustomerTicketModal
          ticket={selectedTicket}
          ticketDbId={selectedTicketDbId}
          currentUserId={currentUserId}
          onClose={() => { setSelectedTicket(null); setSelectedTicketDbId(""); }}
        />
      )}

      {/* ── Quick issue cards ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              How can we help you today?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose a common issue or submit a custom ticket
            </p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20 transition-all"
          >
            <span className="material-symbols-outlined text-base leading-none">add</span>
            New Ticket
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-slate-100 dark:divide-slate-800">
          {QUICK_ISSUES.map((issue) => (
            <button
              key={issue.value}
              onClick={() => openForm(issue.value)}
              className="group flex flex-col items-center gap-2 p-5 text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/40 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-[22px] transition-colors">
                  {issue.icon}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                  {issue.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  {issue.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Ticket history ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {/* Header + filter pills */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            My Tickets
            <span className="ml-2 text-xs font-medium text-slate-400">({tickets.length})</span>
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {(["All", "Open", "Pending", "Resolved"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filterStatus === s
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {s}
                {s !== "All" && (
                  <span className="ml-1.5 opacity-70">{counts[s]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
          {(["Open", "Pending", "Resolved"] as TicketStatus[]).map((s) => (
            <div key={s} className="flex flex-col items-center py-3 px-4">
              <span className={`text-xl font-black ${STATUS_COLORS[s].pill.split(" ")[1]}`}>
                {counts[s]}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`size-1.5 rounded-full ${STATUS_COLORS[s].dot}`} />
                <span className="text-[10px] text-slate-400 font-medium">{s}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Ticket rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-700 mb-3">
              confirmation_number
            </span>
            <p className="text-sm font-medium text-slate-400">No tickets yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Submit your first ticket and we'll get right on it
            </p>
            <button
              onClick={() => openForm()}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity"
            >
              Submit a ticket
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((ticket) => (
              <li key={ticket.id}>
                <button
                  onClick={() => openTicket(ticket)}
                  className="w-full flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                >
                  {/* Status dot */}
                  <div className="flex-shrink-0 mt-1">
                    <span className={`size-2.5 rounded-full block ${STATUS_COLORS[ticket.status].dot}`} />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {ticket.id} · Opened {ticket.createdAt}
                          {ticket.agent && ticket.agent !== "Unassigned" && (
                            <> · Agent: <span className="font-medium">{ticket.agent}</span></>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors text-lg">
                          chevron_right
                        </span>
                      </div>
                    </div>
                    {ticket.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-1">
                        {ticket.description}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
