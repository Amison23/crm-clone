"use client";
import type { AuditEntry, AuditAction } from "./TicketBadges";

const actionConfig: Record<
  AuditAction,
  { icon: string; iconBg: string; iconColor: string }
> = {
  created:       { icon: "confirmation_number", iconBg: "bg-slate-100 dark:bg-slate-800",   iconColor: "text-slate-500 dark:text-slate-400" },
  assigned:      { icon: "person_add",          iconBg: "bg-indigo-100 dark:bg-indigo-900/40", iconColor: "text-indigo-600 dark:text-indigo-400" },
  status_change: { icon: "swap_horiz",          iconBg: "bg-amber-100 dark:bg-amber-900/40",  iconColor: "text-amber-600 dark:text-amber-400" },
  comment:       { icon: "chat_bubble",         iconBg: "bg-sky-100 dark:bg-sky-900/40",      iconColor: "text-sky-600 dark:text-sky-400" },
  resolved:      { icon: "check_circle",        iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
  rated:         { icon: "star",                iconBg: "bg-yellow-100 dark:bg-yellow-900/40",   iconColor: "text-yellow-500 dark:text-yellow-400" },
};

interface TicketAuditLogProps {
  entries: AuditEntry[];
}

export default function TicketAuditLog({ entries }: TicketAuditLogProps) {
  return (
    <div className="px-6 py-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
        Activity Log
      </p>

      <ol className="relative flex flex-col gap-0">
        {entries.map((entry, idx) => {
          const cfg = actionConfig[entry.action];
          const isLast = idx === entries.length - 1;
          return (
            <li key={entry.id} className="flex items-start gap-3 relative">
              {/* Vertical line */}
              {!isLast && (
                <span className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
              )}

              {/* Icon */}
              <span
                className={`relative z-10 flex-shrink-0 size-8 rounded-full flex items-center justify-center ${cfg.iconBg}`}
              >
                <span className={`material-symbols-outlined text-base leading-none ${cfg.iconColor}`}>
                  {cfg.icon}
                </span>
              </span>

              {/* Content */}
              <div className="pb-5 flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    {entry.description}
                  </p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                    {entry.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  by {entry.actor}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
