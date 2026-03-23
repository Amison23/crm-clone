"use client";
import { useState } from "react";
import {
  StatusBadge,
  PriorityBadge,
  SlaBadge,
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  type SlaStatus,
  type AuditEntry,
  type Worker,
  MOCK_WORKERS,
  getMockAuditLog,
} from "./TicketBadges";
import TicketAuditLog from "./TicketAuditLog";

interface TicketsTableProps {
  tickets: Ticket[];
  total: number;
  page: number;
  pageCount: number;
}

// ─── Assign Agent Sub-Modal ────────────────────────────────────────────────
interface AssignAgentModalProps {
  currentAgent: string;
  onAssign: (worker: Worker) => void;
  onClose: () => void;
}

function AssignAgentModal({ currentAgent, onAssign, onClose }: AssignAgentModalProps) {
  const [search, setSearch] = useState("");
  const filtered = MOCK_WORKERS.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Worker list */}
        <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-400">No agents found</li>
          )}
          {filtered.map((worker) => {
            const isCurrentAgent = worker.name === currentAgent;
            return (
              <li key={worker.id}>
                <button
                  onClick={() => { if (!isCurrentAgent) { onAssign(worker); onClose(); } }}
                  disabled={isCurrentAgent}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                    isCurrentAgent
                      ? "opacity-50 cursor-default"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="size-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {worker.initials}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                        worker.isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {worker.name}
                      {isCurrentAgent && (
                        <span className="ml-2 text-[10px] font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full">Current</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{worker.role}</p>
                  </div>

                  {/* Load */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {worker.openTickets + worker.pendingTickets}
                    </p>
                    <p className="text-[10px] text-slate-400">open</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ─── Ticket Modal ────────────────────────────────────────────────────────────
interface TicketModalProps {
  openModal: boolean;
  selectedTicket: Ticket;
  setOpenModal: (openModal: boolean) => void;
  onStatusChange: (status: TicketStatus) => void;
  onClose: () => void;
}

export const TicketModal = ({
  openModal,
  selectedTicket,
  setOpenModal,
  onStatusChange,
  onClose,
}: TicketModalProps) => {
  const [showAssign, setShowAssign] = useState(false);
  const [agent, setAgent] = useState(selectedTicket.agent);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(() =>
    getMockAuditLog(selectedTicket.id)
  );

  function handleAssign(worker: Worker) {
    const newEntry: AuditEntry = {
      id: `a-${Date.now()}`,
      action: "assigned",
      actor: "Alex Director",
      actorInitials: "AD",
      description: `Reassigned to ${worker.name}`,
      timestamp: "just now",
    };
    setAgent(worker.name);
    setAuditLog((prev) => [newEntry, ...prev]);
  }

  if (!openModal) return null;

  return (
    <>
      {showAssign && (
        <AssignAgentModal
          currentAgent={agent}
          onAssign={handleAssign}
          onClose={() => setShowAssign(false)}
        />
      )}

      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setOpenModal(false);
            onClose();
          }
        }}
      >
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-xl flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div>
              <p className="text-xs text-slate-400 mb-1">{selectedTicket?.id}</p>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {selectedTicket?.subject}
              </h2>
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

            {/* Audit log */}
            <div className="border-b border-slate-200 dark:border-slate-800">
              <TicketAuditLog entries={auditLog} />
            </div>
          </div>

          {/* Actions — always pinned to bottom */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
            <button
              onClick={() => { setOpenModal(false); onClose(); }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setShowAssign(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base leading-none">person_add</span>
              Assign agent
            </button>
            <button
              onClick={() => {
                onStatusChange("Resolved");
                setOpenModal(false);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-opacity shadow-sm"
            >
              Mark resolved
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Ticket Table ─────────────────────────────────────────────────────────────
export default function TicketTable({ tickets, total, page, pageCount }: TicketsTableProps) {
  const start = tickets.length > 0 ? (page - 1) * tickets.length + 1 : 0;
  const end = start + tickets.length - (tickets.length > 0 ? 1 : 0);

  const [openModal, setOpenModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [, setStatus] = useState<TicketStatus>("Open");

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              {["Ticket ID", "Subject", "Status", "Priority", "SLA Status", "Agent"].map((col) => (
                <th
                  key={col}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800"
                >
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
                  onClick={() => {
                    setOpenModal(true);
                    setSelectedTicket(ticket);
                  }}
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
          setOpenModal={setOpenModal}
          onStatusChange={setStatus}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}