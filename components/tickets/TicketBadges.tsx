export type TicketStatus = "Open" | "Pending" | "Resolved";
export type TicketPriority = "Urgent" | "High" | "Medium" | "Low";
export type SlaStatus = "Overdue" | "At risk" | "On track";
export type AuditAction =
  | "assigned"
  | "status_change"
  | "comment"
  | "resolved"
  | "rated"
  | "created";

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  customer: string;
  createdAt: string;
  status: TicketStatus;
  priority: TicketPriority;
  sla: SlaStatus;
  agent: string;
  agentId?: string;
  agentInitials?: string;
  rawId?: string;
}

export interface Worker {
  id: string;
  name: string;
  initials: string;
  role: string;
  isActive: boolean;
  openTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
}

export interface AuditEntry {
  id: string;
  action: AuditAction;
  actor: string;
  actorInitials: string;
  description: string;
  timestamp: string;
}

export const MOCK_WORKERS: Worker[] = [
  { id: "w1", name: "John Doe",     initials: "JD", role: "Senior Agent",  isActive: true,  openTickets: 3, pendingTickets: 1, resolvedTickets: 14 },
  { id: "w2", name: "Jane Smith",   initials: "JS", role: "Support Agent", isActive: true,  openTickets: 2, pendingTickets: 2, resolvedTickets: 21 },
  { id: "w3", name: "Mike Ross",    initials: "MR", role: "Support Agent", isActive: false, openTickets: 0, pendingTickets: 1, resolvedTickets: 9  },
  { id: "w4", name: "Sarah Connor", initials: "SC", role: "Senior Agent",  isActive: true,  openTickets: 5, pendingTickets: 0, resolvedTickets: 31 },
  { id: "w5", name: "Ali Hassan",   initials: "AH", role: "Junior Agent",  isActive: true,  openTickets: 1, pendingTickets: 3, resolvedTickets: 6  },
];

export function getMockAuditLog(ticketId: string): AuditEntry[] {
  return [
    { id: "a1", action: "created",      actor: "System",       actorInitials: "SY", description: `Ticket ${ticketId} opened by customer`,           timestamp: "3 days ago" },
    { id: "a2", action: "assigned",     actor: "Alex Director", actorInitials: "AD", description: "Assigned to John Doe",                           timestamp: "3 days ago" },
    { id: "a3", action: "status_change",actor: "John Doe",      actorInitials: "JD", description: "Status changed from Open → Pending",              timestamp: "2 days ago" },
    { id: "a4", action: "comment",      actor: "John Doe",      actorInitials: "JD", description: "Added a reply: 'Working on this now''",           timestamp: "1 day ago" },
    { id: "a5", action: "resolved",     actor: "John Doe",      actorInitials: "JD", description: "Marked ticket as Resolved",                      timestamp: "4 hours ago" },
    { id: "a6", action: "rated",        actor: "Customer",      actorInitials: "CU", description: "Customer rated resolution ★★★★☆ (4/5)",          timestamp: "2 hours ago" },
  ];
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    Open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    Resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles: Record<TicketPriority, string> = {
    Urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    Medium: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    Low: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[priority]}`}>
      {priority}
    </span>
  );
}

export function SlaBadge({ sla }: { sla: SlaStatus }) {
  const styles: Record<SlaStatus, { text: string; dot: string }> = {
    Overdue: { text: "text-red-600 dark:text-red-400", dot: "bg-red-600 dark:bg-red-400 animate-pulse" },
    "At risk": { text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-600 dark:bg-amber-400" },
    "On track": { text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-600 dark:bg-emerald-400" },
  };
  const s = styles[sla];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${s.text}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {sla}
    </span>
  );
}