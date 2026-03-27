"use client";

import { useState } from "react";
import TicketFilters, { type FilterOption } from "@/components/tickets/TicketFilters";
import TicketTable from "@/components/tickets/TicketTable";
import CustomerTicketView from "@/components/tickets/CustomerTicketView";
import type { Ticket, TicketStatus, TicketPriority, SlaStatus } from "@/components/tickets/TicketBadges";

const MOCK_TICKETS: Ticket[] = [
  {
    id: "#TK-1024",
    subject: "Login issue on mobile app",
    description: "User is unable to login to the mobile app",
    customer: "Alice Cooper",
    createdAt: "2h ago",
    status: "Open",
    priority: "Urgent",
    sla: "Overdue",
    agent: "John Doe",
  },
  {
    id: "#TK-1025",
    subject: "Payment gateway timeout",
    description: "User is unable to make payments through the payment gateway",
    customer: "Bob Marley",
    createdAt: "4h ago",
    status: "Pending",
    priority: "High",
    sla: "At risk",
    agent: "Jane Smith",
  },
  {
    id: "#TK-1026",
    subject: "Update billing address",
    description: "User is unable to update their billing address",
    customer: "Charlie Sheen",
    createdAt: "1d ago",
    status: "Resolved",
    priority: "Low",
    sla: "On track",
    agent: "Mike Ross",
  },
  {
    id: "#TK-1027",
    subject: "Feature request: Dark mode",
    description: "User is requesting a dark mode feature",
    customer: "Diana Prince",
    createdAt: "2d ago",
    status: "Open",
    priority: "Medium",
    sla: "On track",
    agent: "Sarah Connor",
  },
];

interface TicketsClientProps {
  role: "admin" | "sales_agent" | "customer";
  ticketsData: any[] | null;
  companyId?: string;
  currentUserId?: string;
}

export default function TicketsClient({ role, ticketsData, companyId, currentUserId }: TicketsClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All Tickets");
  const [activePriority, setActivePriority] = useState<TicketPriority | "All Priorities">("All Priorities");
  const [activeSla, setActiveSla] = useState<SlaStatus | "All SLA">("All SLA");

  // Map DB tickets to UI format
  const dbTickets: Ticket[] = (ticketsData || []).map(t => {
    const statusMap: Record<string, TicketStatus> = {
      open: "Open",
      in_progress: "Pending",
      on_hold: "Pending",
      resolved: "Resolved",
      closed: "Resolved"
    };
    const priorityMap: Record<string, TicketPriority> = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Urgent"
    };
    return {
      id: `#${t.id.slice(0, 8).toUpperCase()}`,
      subject: t.title,
      description: t.description || "",
      customer: t.client?.full_name || t.client_id || "Unknown Customer",
      createdAt: new Date(t.created_at).toLocaleDateString(),
      status: statusMap[t.status] || "Open",
      priority: priorityMap[t.priority] || "Low",
      sla: "On track",
      agent: t.agent?.full_name || t.assigned_to || "Unassigned",
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

  // ── Admin / agent view ─────────────────────────────────────────────────────
  const allTickets = [...dbTickets, ...MOCK_TICKETS];

  const filteredTickets = allTickets.filter((ticket) => {
    const statusMatch = activeFilter === "All Tickets" || ticket.status === activeFilter;
    const priorityMatch = activePriority === "All Priorities" || ticket.priority === activePriority;
    const slaMatch = activeSla === "All SLA" || ticket.sla === activeSla;
    return statusMatch && priorityMatch && slaMatch;
  });

  return (
    <>
      <TicketFilters
        active={activeFilter}
        onFilterChange={setActiveFilter}
        activePriority={activePriority}
        onPriorityChange={setActivePriority}
        activeSla={activeSla}
        onSlaChange={setActiveSla}
        tickets={allTickets}
        role={role}
      />

      <TicketTable
        tickets={filteredTickets}
        total={filteredTickets.length}
        page={1}
        pageCount={1}
        role={role}
      />
    </>
  );
}
