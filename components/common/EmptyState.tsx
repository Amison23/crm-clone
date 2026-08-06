import { type ElementType } from "react";

interface EmptyStateProps {
  /** Lucide icon component to render above the text */
  icon?: ElementType;
  /** Short declarative title — state what's missing, not why it's sad */
  title: string;
  /** One-sentence description: what belongs here and what to do next */
  description: string;
  /** Optional primary action */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Shared empty state for all list/table views across the admin console.
 * Renders within the content area of a table — not full-page.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="mb-4 size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Icon className="size-5 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {title}
      </p>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
