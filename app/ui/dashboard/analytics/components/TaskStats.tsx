'use client';

import { CheckCircle2, AlertCircle, Clock, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Trend { value: number; isPositive: boolean; }

export default function TaskStats({ productivity }: { productivity: any }) {
  const { totalTasks, completedTasks, overdueTasks } = productivity;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeQueue = totalTasks - completedTasks;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* 1. PRODUCTIVITY YIELD */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={18} />
          </div>
          <div className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">Optimal</div>
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Productivity Yield</p>
        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{completionRate}%</p>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${completionRate}%` }} />
        </div>
      </div>

      {/* 2. CRITICAL FRICTION */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm group">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-xl ${overdueTasks > 0 ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
            <AlertCircle size={18} className={overdueTasks > 0 ? 'animate-pulse' : ''} />
          </div>
          {overdueTasks > 0 && <div className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 text-[8px] font-black uppercase tracking-widest border border-rose-100">Critical</div>}
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Critical Friction</p>
        <div className="flex items-center gap-3">
          <p className={`text-4xl font-black tracking-tighter ${overdueTasks > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>{overdueTasks}</p>
          {overdueTasks > 0 && <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />}
        </div>
        <p className="text-[8px] font-bold text-slate-400 uppercase mt-2 italic">{overdueTasks > 0 ? 'Requires Immediate Node Audit' : 'Node Operational'}</p>
      </div>

      {/* 3. QUEUE DENSITY */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600">
            <Clock size={18} />
          </div>
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Queue Density</p>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{activeQueue}</p>
          <span className="text-[10px] font-bold text-blue-500 uppercase">Active</span>
        </div>
        <p className="text-[8px] font-bold text-slate-400 uppercase mt-2 italic tracking-tight">Current Processing Load</p>
      </div>

      {/* 4. SYSTEM VELOCITY */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Zap size={18} />
          </div>
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">System Velocity</p>
        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{totalTasks}</p>
        <p className="text-[8px] font-bold text-slate-400 uppercase mt-2 italic tracking-tight">Gross Node Output</p>
      </div>
    </div>
  );
}