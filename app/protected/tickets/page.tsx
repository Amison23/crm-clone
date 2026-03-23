"use client";

import { useState } from "react";
import TicketFilters, { type FilterOption } from "@/components/tickets/TicketFilters";
import TicketTable from "@/components/tickets/TicketTable";
import type { Ticket, TicketPriority, SlaStatus } from "@/components/tickets/TicketBadges";

// MOCK_TICKETS remains for demonstration
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

export default function TicketsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All Tickets");
  const [activePriority, setActivePriority] = useState<TicketPriority | "All Priorities">("All Priorities");
  const [activeSla, setActiveSla] = useState<SlaStatus | "All SLA">("All SLA");



  const filteredTickets = MOCK_TICKETS.filter((ticket) => {
    const statusMatch = activeFilter === "All Tickets" || ticket.status === activeFilter;
    const priorityMatch = activePriority === "All Priorities" || ticket.priority === activePriority;
    const slaMatch = activeSla === "All SLA" || ticket.sla === activeSla;
    
    return statusMatch && priorityMatch && slaMatch;
  });

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black leading-tight tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Track and manage active customer support requests
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-xl">ios_share</span>
          Export
        </button>
      </div>

      {/* Filters */}
      <TicketFilters 
        active={activeFilter} 
        onFilterChange={setActiveFilter} 
        activePriority={activePriority}
        onPriorityChange={setActivePriority}
        activeSla={activeSla}
        onSlaChange={setActiveSla}
        tickets={MOCK_TICKETS} 
      />

      {/* Table */}
      <TicketTable
        tickets={filteredTickets}
        total={filteredTickets.length}
        page={1}
        pageCount={1}
      />
    </>
  );
}