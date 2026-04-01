'use client';

import { useIntelligence } from '@/hooks/useIntelligence';
import { SummarySkeleton } from './SummarySkeleton';
import { TrendingUp, Target, Zap, AlertCircle, ArrowUpRight, Database } from 'lucide-react';

interface SummaryCardsProps {
  hideFinancials?: boolean;
  className?: string; // 🎯 Crucial for layout spanning
}

export default function SummaryCards({ hideFinancials = false, className = "" }: SummaryCardsProps) {
  const { intelligence, isLoading, isError } = useIntelligence();

  if (isLoading) return <SummarySkeleton />;
  if (isError || !intelligence) return null;

  const { sales, productivity, meta } = intelligence;
  const precisionRate = productivity.totalTasks > 0
    ? Math.round((productivity.completedTasks / productivity.totalTasks) * 100)
    : 0;

  const formattedRevenue = new Intl.NumberFormat('en-KE').format(sales.totalRevenue);
  const revenueSize = formattedRevenue.length > 10 ? 'text-3xl' : 'text-5xl';

  return (
    /* 🎯 Logic: If hideFinancials is true, internal grid is 2 cols. 
       External className handles the 4-col span. */
    <div className={`grid grid-cols-1 ${hideFinancials ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 ${className}`}>
      
      {/* 1. SETTLED REVENUE */}
      {!hideFinancials && (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm group hover:border-emerald-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform"><TrendingUp size={20} /></div>
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
              <ArrowUpRight size={10} /> Active Yield
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1.5">Settled Revenue</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-emerald-600/50 uppercase">Kes</span>
            <h3 className={`${revenueSize} font-black  text-slate-900 dark:text-white tracking-tighter leading-none`}>{formattedRevenue}</h3>
          </div>
        </div>
      )}

      {/* 2. OBJECTIVE PRECISION */}
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm group hover:border-blue-500/30 transition-all duration-500">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 group-hover:rotate-12 transition-transform"><Target size={20} /></div>
          {productivity.overdueTasks > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-100 animate-pulse">
              {productivity.overdueTasks} Overdue
            </div>
          )}
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1.5">Objective Precision</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{precisionRate}%</h3>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter italic">Sync</span>
        </div>
      </div>

      {/* 3. WORKSPACE THROUGHPUT */}
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm group hover:border-primary/30 transition-all duration-500">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Zap size={20} className="animate-pulse" /></div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{meta.nodeId.slice(0, 8)}</span>
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1.5">Workspace Volume</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{sales.totalLeads}</h3>
          <span className="text-[10px] font-bold text-primary uppercase tracking-tighter italic">Nodes</span>
        </div>
      </div>
    </div>
  );
}