'use client'; // Required for hooks

import { useIntelligence } from '@/hooks/useIntelligence';
import { SummarySkeleton } from './SummarySkeleton'; // Create this for better UX

export default function SummaryCards() {
  const { intelligence, isLoading, isError } = useIntelligence();

  if (isLoading) return <SummarySkeleton />;
  if (isError || !intelligence) return <div>Sync Lost...</div>;

  const { sales, productivity } = intelligence;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* REVENUE CARD */}
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Settled Revenue</p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black text-emerald-600/50 uppercase">Kes</span>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
            {Number(sales.totalRevenue).toLocaleString()}
          </h3>
        </div>
        <div className="mt-4">
          <span className="px-2 py-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
            {sales.conversionRate} Yield
          </span>
        </div>
      </div>

      {/* OBJECTIVE PRECISION CARD */}
      {/* ... Task logic follows the same pattern */}
    </div>
  );
}