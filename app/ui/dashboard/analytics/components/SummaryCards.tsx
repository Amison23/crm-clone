'use client';

import { TrendingUp, Target, Zap, ArrowUpRight } from 'lucide-react';

interface SummaryCardsProps {
  sales?: {
    totalLeads: number;
    totalRevenue: number;
    conversionRate: string;
  };
  productivity?: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
  nodeId?: string;
  hideFinancials?: boolean;
  className?: string;
}

export default function SummaryCards({ 
  sales, 
  productivity, 
  nodeId = "NODE-OFFLINE", 
  hideFinancials = false, 
  className = "" 
}: SummaryCardsProps) {

  const precisionRate = (productivity?.totalTasks ?? 0) > 0
    ? Math.round(((productivity?.completedTasks ?? 0) / (productivity?.totalTasks ?? 1)) * 100)
    : 0;

  const formattedRevenue = new Intl.NumberFormat('en-KE', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(sales?.totalRevenue || 0);

  return (
    <div className={`grid grid-cols-1 ${hideFinancials ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 ${className}`}>
      
      {/* 1. SETTLED REVENUE */}
      {!hideFinancials && (
        <div className="relative h-[220px] group">
          {/* GHOST PLACEHOLDER: Keeps the grid layout from jumping */}
          <div className="p-8 border border-transparent rounded-[2.5rem]" />

          {/* EXPANDING CARD */}
          <div className="absolute top-0 left-0 h-full w-full group-hover:w-[140%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm group-hover:shadow-2xl group-hover:border-emerald-500/40 transition-all duration-500 ease-in-out z-10 group-hover:z-50 overflow-hidden whitespace-nowrap">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                <TrendingUp size={20} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                <ArrowUpRight size={10} /> {sales?.conversionRate || '0%'}
              </div>
            </div>
            
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1.5">Settled Revenue</p>
            
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black text-emerald-600/50 uppercase">Kes</span>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                {formattedRevenue}
              </h3>
            </div>

            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
               <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest italic flex items-center gap-2">
                 <span className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" /> Global Yield Verified
               </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. OBJECTIVE PRECISION */}
      <div className="relative h-[220px] group">
        <div className="p-8 border border-transparent rounded-[2.5rem]" />
        <div className="absolute top-0 left-0 h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm group-hover:shadow-2xl group-hover:border-blue-500/40 transition-all duration-500 z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 group-hover:rotate-12 transition-transform"><Target size={20} /></div>
            {(productivity?.overdueTasks ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-100 animate-pulse">
                {productivity?.overdueTasks} Overdue
              </div>
            )}
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1.5">Objective Precision</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{precisionRate}%</h3>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter italic">Sync</span>
          </div>
        </div>
      </div>

      {/* 3. WORKSPACE THROUGHPUT */}
      <div className="relative h-[220px] group">
        {/* Placeholder */}
        <div className="p-8 border border-transparent rounded-[2.5rem]" />

        {/* EXPANDING CARD (Horizontal slide for Node ID) */}
        <div className="absolute top-0 right-0 h-full w-full group-hover:w-[160%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm group-hover:shadow-2xl group-hover:border-primary/40 transition-all duration-500 ease-in-out z-10 group-hover:z-50 overflow-hidden whitespace-nowrap origin-right">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Zap size={20} className="animate-pulse" /></div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {nodeId}
              </span>
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1.5">Workspace Volume</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              {sales?.totalLeads || 0}
            </h3>
            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter italic">Leads</span>
          </div>
        </div>
      </div>
    </div>
  );
}