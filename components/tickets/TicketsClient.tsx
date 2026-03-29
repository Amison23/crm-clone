"use client";

import { useState } from "react";
import TicketFilters, { type FilterOption } from "@/components/tickets/TicketFilters";
import TicketTable from "@/components/tickets/TicketTable";
import CustomerTicketView from "@/components/tickets/CustomerTicketView";
import type { Ticket, TicketStatus, TicketPriority, SlaStatus } from "@/components/tickets/TicketBadges";

interface TicketsClientProps {
  role: "admin" | "sales_agent" | "customer";
  ticketsData: any[] | null;
  companyId?: string;
  currentUserId?: string;
}

/** Compute a simple SLA label based on creation date and current status */
function computeSla(createdAt: string, status: string): SlaStatus {
  if (status === "resolved" || status === "closed") return "On track";
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  if (ageHours > 48) return "Overdue";
  if (ageHours > 24) return "At risk";
  return "On track";
}

export default function TicketsClient({ role, ticketsData, companyId, currentUserId }: TicketsClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All Tickets");
  const [activePriority, setActivePriority] = useState<TicketPriority | "All Priorities">("All Priorities");
  const [activeSla, setActiveSla] = useState<SlaStatus | "All SLA">("All SLA");

  // Map DB tickets to UI format — uses the joined assigned_agent data from page.tsx
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
    return {
      id: `#${t.id.slice(0, 8).toUpperCase()}`,
      subject: t.title,
      description: t.description || "",
      customer: t.client_id || "Unknown Customer",
      createdAt: new Date(t.created_at).toLocaleDateString(),
      status: statusMap[t.status] || "Open",
      priority: priorityMap[t.priority] || "Low",
      sla: computeSla(t.created_at, t.status),
      // Use joined employee name, fallback gracefully
      agent: t.assigned_agent?.full_name ?? "Unassigned",
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

  // ── Admin / agent view — only real DB tickets ─────────────────────────────
  const filteredTickets = dbTickets.filter((ticket) => {
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
        tickets={dbTickets}
        role={role}
      />

      <TicketTable
        tickets={filteredTickets}
        rawTickets={ticketsData ?? []}
        total={filteredTickets.length}
        page={1}
        pageCount={1}
        role={role}
      />
    </>
  );
}
