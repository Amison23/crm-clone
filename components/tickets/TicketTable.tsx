"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  StatusBadge,
  PriorityBadge,
  SlaBadge,
  type Ticket,
  type TicketStatus,
  type AuditEntry,
} from "./TicketBadges";
import TicketAuditLog from "./TicketAuditLog";

interface TicketsTableProps {
  tickets: Ticket[];
  rawTickets: any[];
  total: number;
  page: number;
  pageCount: number;
  role: "admin" | "customer" | "sales_agent";
}

// ─── DB Employee type ────────────────────────────────────────────────────────
interface DbEmployee {
  id: string;
  full_name: string;
  role: string;
}

// ─── Assign Agent Sub-Modal ──────────────────────────────────────────────────
interface AssignAgentModalProps {
  currentAgentName: string;
  onAssign: (emp: DbEmployee) => void;
  onClose: () => void;
}

function AssignAgentModal({ currentAgentName, onAssign, onClose }: AssignAgentModalProps) {
  const supabase = createClient();
  const [employees, setEmployees] = useState<DbEmployee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("employees")
        .select("id, full_name, role")
        .in("role", ["super_admin", "company_admin", "sales_agent", "server_admin"])
        .order("full_name");
      setEmployees(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = employees.filter((e) =>
    e.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel: Record<string, string> = {
    super_admin: "Super Admin",
    company_admin: "Company Admin",
    sales_agent: "Sales Agent",
    server_admin: "Server Admin",
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Assign Agent</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              autoFocus
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Employee list */}
        <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <li className="px-5 py-8 text-center text-sm text-slate-400">Loading agents…</li>
          ) : filtered.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-slate-400">No agents found</li>
          ) : (
            filtered.map((emp) => {
              const isCurrent = emp.full_name === currentAgentName;
              const initials = emp.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <li key={emp.id}>
                  <button
                    onClick={() => { if (!isCurrent) { onAssign(emp); onClose(); } }}
                    disabled={isCurrent}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                      isCurrent ? "opacity-50 cursor-default" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="size-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {emp.full_name}
                        {isCurrent && (
                          <span className="ml-2 text-[10px] font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full">Current</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabel[emp.role] ?? emp.role}</p>
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

// ─── Ticket Modal ────────────────────────────────────────────────────────────
interface TicketModalProps {
  openModal: boolean;
  selectedTicket: Ticket;
  rawTicketId: string; // real UUID from DB
  currentUserId?: string;
  setOpenModal: (v: boolean) => void;
  onStatusChange: (status: TicketStatus) => void;
  onClose: () => void;
}

export const TicketModal = ({
  openModal,
  selectedTicket,
  rawTicketId,
  currentUserId,
  setOpenModal,
  onStatusChange,
  onClose,
}: TicketModalProps) => {
  const supabase = createClient();
  const [showAssign, setShowAssign] = useState(false);
  const [agent, setAgent] = useState(selectedTicket.agent);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load real audit data: ticket_assignments + ticket_comments
  useEffect(() => {
    if (!rawTicketId) return;
    async function load() {
      setLoadingAudit(true);
      const entries: AuditEntry[] = [];

      // Fetch assignment history
      const { data: assignments } = await supabase
        .from("ticket_assignments")
        .select("id, assigned_to, assigned_by, created_at")
        .eq("ticket_id", rawTicketId)
        .order("created_at", { ascending: false });

      (assignments ?? []).forEach((a) => {
        entries.push({
          id: a.id,
          action: "assigned",
          actor: "Agent",
          actorInitials: "AG",
          description: `Ticket assigned`,
          timestamp: new Date(a.created_at).toLocaleString(),
        });
      });

      // Fetch all comments (public + internal) for the agent/admin view
      const { data: comments } = await supabase
        .from("ticket_comments")
        .select("id, author_id, body, is_internal, created_at")
        .eq("ticket_id", rawTicketId)
        .order("created_at", { ascending: false });

      (comments ?? []).forEach((c) => {
        entries.push({
          id: c.id,
          action: "comment",
          actor: c.is_internal ? "Internal Note" : "Comment",
          actorInitials: c.is_internal ? "🔒" : "💬",
          description: c.body,
          timestamp: new Date(c.created_at).toLocaleString(),
        });
      });

      // Sort by timestamp descending
      entries.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setAuditLog(entries);
      setLoadingAudit(false);
    }
    load();
  }, [rawTicketId]);

  async function handleAssign(emp: DbEmployee) {
    if (!rawTicketId) return;
    setSaving(true);
    // Update the ticket's assigned_to
    await supabase
      .from("tickets")
      .update({ assigned_to: emp.id, updated_at: new Date().toISOString() })
      .eq("id", rawTicketId);

    // Insert assignment audit record
    await supabase.from("ticket_assignments").insert({
      ticket_id: rawTicketId,
      assigned_to: emp.id,
      assigned_by: currentUserId ?? emp.id,
    });

    const newEntry: AuditEntry = {
      id: `a-${Date.now()}`,
      action: "assigned",
      actor: "Agent",
      actorInitials: "AG",
      description: `Reassigned to ${emp.full_name}`,
      timestamp: new Date().toLocaleString(),
    };
    setAgent(emp.full_name);
    setAuditLog((prev) => [newEntry, ...prev]);
    setSaving(false);
  }

  async function handleResolve() {
    if (!rawTicketId) return;
    setSaving(true);
    await supabase
      .from("tickets")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", rawTicketId);
    onStatusChange("Resolved");
    setSaving(false);
    setOpenModal(false);
    onClose();
  }

  if (!openModal) return null;

  return (
    <>
      {showAssign && (
        <AssignAgentModal
          currentAgentName={agent}
          onAssign={handleAssign}
          onClose={() => setShowAssign(false)}
        />
      )}

      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) { setOpenModal(false); onClose(); } }}
      >
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-xl flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div>
              <p className="text-xs text-slate-400 mb-1">{selectedTicket?.id}</p>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedTicket?.subject}</h2>
            </div>
            <button
              onClick={() => { setOpenModal(false); onClose(); }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mt-0.5"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            {/* Badges */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex-wrap">
              <StatusBadge status={selectedTicket?.status} />
              <PriorityBadge priority={selectedTicket?.priority} />
              <SlaBadge sla={selectedTicket?.sla} />
              <span className="ml-auto text-xs text-slate-400">
                {selectedTicket?.customer} · {selectedTicket?.createdAt}
              </span>
            </div>

            {/* Description */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Description</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedTicket?.description ?? "No description provided."}
              </p>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              {[
                { label: "Agent", value: agent },
                { label: "Customer", value: selectedTicket?.customer },
                { label: "Opened", value: selectedTicket?.createdAt },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
                </div>
              ))}
            </div>

            {/* Audit log — real data */}
            <div className="border-b border-slate-200 dark:border-slate-800">
              {loadingAudit ? (
                <div className="px-6 py-6 flex items-center gap-2 text-sm text-slate-400">
                  <span className="size-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  Loading history…
                </div>
              ) : (
                <TicketAuditLog entries={auditLog} />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
            <button
              onClick={() => { setOpenModal(false); onClose(); }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setShowAssign(true)}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base leading-none">person_add</span>
              Assign agent
            </button>
            <button
              onClick={handleResolve}
              disabled={saving || selectedTicket?.status === "Resolved"}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : "Mark resolved"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Ticket Table ─────────────────────────────────────────────────────────────
export default function TicketTable({ tickets, rawTickets, total, page, pageCount, role }: TicketsTableProps) {
  const start = tickets.length > 0 ? (page - 1) * tickets.length + 1 : 0;
  const end = start + tickets.length - (tickets.length > 0 ? 1 : 0);

  const [openModal, setOpenModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [rawTicketId, setRawTicketId] = useState("");
  const [, setStatus] = useState<TicketStatus>("Open");

  const filteredColumns: Record<string, string[]> = {
    admin:      ["Ticket ID", "Subject", "Status", "Priority", "SLA Status", "Agent"],
    sales_agent:["Ticket ID", "Subject", "Status", "Priority", "SLA Status", "Agent"],
    customer:   ["Ticket ID", "Subject", "Status", "Priority", "SLA Status"],
  };

  function openTicketModal(ticket: Ticket) {
    // Look up the raw UUID using the display ID prefix
    const raw = rawTickets.find(
      (r) => `#${r.id.slice(0, 8).toUpperCase()}` === ticket.id
    );
    setSelectedTicket(ticket);
    setRawTicketId(raw?.id ?? "");
    setOpenModal(true);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              {filteredColumns[role].map((col) => (
                <th key={col} className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => openTicketModal(ticket)}
                >
                  <td className="px-6 py-4 text-sm font-bold">{ticket.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{ticket.subject}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        Customer: {ticket.customer} • {ticket.createdAt}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                  <td className="px-6 py-4"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="px-6 py-4"><SlaBadge sla={ticket.sla} /></td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-medium">{ticket.agent}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  No tickets found matching this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="text-slate-900 dark:text-slate-100">{start} to {end}</span> of{" "}
          <span className="text-slate-900 dark:text-slate-100">{total}</span> tickets
        </p>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30">
            <span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`size-8 rounded text-xs font-medium ${
                p === page
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {p}
            </button>
          ))}
          <button disabled={page === pageCount} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30">
            <span className="material-symbols-outlined text-lg leading-none">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          openModal={openModal}
          selectedTicket={selectedTicket}
          rawTicketId={rawTicketId}
          setOpenModal={setOpenModal}
          onStatusChange={setStatus}
          onClose={() => { setSelectedTicket(null); setRawTicketId(""); }}
        />
      )}
    </div>
  );
}