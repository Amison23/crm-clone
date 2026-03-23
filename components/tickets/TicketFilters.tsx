"use client";

import { useState, useRef, useEffect } from "react";
import type { Ticket, TicketPriority, SlaStatus } from "./TicketBadges";

export const FILTER_OPTIONS = ["All Tickets", "Open", "Pending", "Resolved"] as const;
export type FilterOption = (typeof FILTER_OPTIONS)[number];

interface TicketFiltersProps {
  active: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  activePriority: TicketPriority | "All Priorities";
  onPriorityChange: (priority: TicketPriority | "All Priorities") => void;
  activeSla: SlaStatus | "All SLA";
  onSlaChange: (sla: SlaStatus | "All SLA") => void;
  tickets: Ticket[];
}

export default function TicketFilters({ 
  active, 
  onFilterChange, 
  activePriority, 
  onPriorityChange, 
  activeSla, 
  onSlaChange, 
  tickets 
}: TicketFiltersProps) {
  const [showMore, setShowMore] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive counts from actual ticket data
  const counts: Record<FilterOption, number> = {
    "All Tickets": tickets.length,
    Open: tickets.filter((t) => t.status === "Open").length,
    Pending: tickets.filter((t) => t.status === "Pending").length,
    Resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_OPTIONS.map((label) => {
        const count = counts[label];
        return (
          <button
            key={label}
            onClick={() => onFilterChange(label)}
            className={`flex h-10 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors ${active === label
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
          >
            <span className="text-sm font-semibold">{label}</span>
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${active === label
                    ? "bg-white/20 text-white"
                    : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                  }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}

      <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block" />

      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setShowMore(!showMore)}
          className={`flex h-10 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${showMore ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}
        >
          <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
          <span className="text-sm font-medium">More Filters</span>
          {(activePriority !== "All Priorities" || activeSla !== "All SLA") && (
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
          )}
        </button>

        {showMore && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Priority
              </label>
              <select 
                value={activePriority}
                onChange={(e) => onPriorityChange(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm p-2 outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              >
                <option value="All Priorities">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                SLA Status
              </label>
              <select 
                value={activeSla}
                onChange={(e) => onSlaChange(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm p-2 outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              >
                <option value="All SLA">All SLA</option>
                <option value="Overdue">Overdue</option>
                <option value="At risk">At risk</option>
                <option value="On track">On track</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => {
                  onPriorityChange("All Priorities");
                  onSlaChange("All SLA");
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}