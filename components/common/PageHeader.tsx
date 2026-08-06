import { type ReactNode, type ElementType } from "react";

interface PageHeaderProps {
  /** Primary page title — plain weight, one color, no decoration */
  title: string;
  /** One-line plain-sentence description */
  description: string;
  /** Optional right-side button or action element */
  action?: ReactNode;
  /** Optional status badge in the header */
  badge?: {
    label: string;
    /** If true, renders a static "verified" badge (no animation) */
    verified?: boolean;
    /** If true, renders a pulsing "live" indicator */
    live?: boolean;
  };
}

/**
 * Shared page header for all super-admin sub-pages.
 * Keeps a consistent hierarchy across every utility page —
 * confident but not louder than its own content.
 */
export default function PageHeader({
  title,
  description,
  action,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {badge.live && (
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              {badge.verified && (
                <span className="size-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              )}
              {badge.label}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          {description}
        </p>
      </div>
      {action && (
        <div className="flex items-center gap-2 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
