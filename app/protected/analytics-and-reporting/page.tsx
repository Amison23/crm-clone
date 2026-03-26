'use client';

import { useIntelligence } from '@/hooks/useIntelligence';
import { Suspense } from 'react';

// Intelligence Engine Components
import SummaryCards from '@/app/ui/dashboard/analytics/components/SummaryCards';
import PerformanceDeepDive from '@/app/ui/dashboard/analytics/components/PerfomanceDeepDive';
import OperationsDeepDive from '@/app/ui/dashboard/analytics/components/OperationsDeepDive';
import AgentReport from '@/app/ui/dashboard/analytics/components/AgentReport';
import ConversionMatrix from '@/app/ui/dashboard/analytics/components/ConversionMatrix';
import { SummarySkeleton } from '@/app/ui/dashboard/analytics/components/SummarySkeleton';

// HCI Enhancement: Added Lucide icons for better recognition (recognition over recall)
import { Download, FileJson, Activity, Calendar, Users, Target } from 'lucide-react';

export default function AnalyticsAndReporting() {
  const { intelligence, isLoading } = useIntelligence();

  // Mapping current intelligence data for the matrix
  const conversionData = intelligence ? {
    wins: intelligence.sales.totalLeads * 0.2,
    losses: intelligence.sales.totalLeads * 0.1,
    total_leads: intelligence.sales.totalLeads,
    total_revenue: intelligence.sales.totalRevenue,
    conversion_rate_percentage: 14.9
  } : null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] selection:bg-primary selection:text-white">
      <div className="w-full flex-1 relative flex flex-col">
        <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto w-full">
          
          {/* --- 1. HEADER: Improved Visual Hierarchy --- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                  Operational <span className="text-primary">Insights</span>
                </h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium italic pl-1">
                Evidence-based performance metrics for the current fiscal cycle.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95">
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
                <FileJson className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* --- 2. CONTROLS: Grouped for Mental Models --- */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-wrap gap-6 items-center shadow-sm">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer appearance-none">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <Users className="w-4 h-4 text-slate-400" />
              <select className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer appearance-none">
                <option>All Agents</option>
                <option>High Performance</option>
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-full uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Live: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* --- 3. SUMMARY VITALS: Skeletal Loading for Feedback --- */}
{isLoading ? (
  <SummarySkeleton />
) : (
  <SummaryCards />
)}
          {/* --- 4. CONVERSION & LEADERBOARD: Balanced Cognitive Load --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 flex items-center gap-2">
                <Target className="w-3 h-3" /> Yield Matrix
              </h3>
              {conversionData && <ConversionMatrix data={conversionData} />}
            </div>

            <div className="lg:col-span-8 flex flex-col gap-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 flex items-center gap-2">
                <Users className="w-3 h-3" /> Agent Throughput
              </h3>
              <AgentReport agents={[]} /> 
            </div>
          </div>

          {/* --- 5. TREND ANALYSIS: Large Hit Areas --- */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 px-2">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">Temporal Growth Velocity</h2>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <PerformanceDeepDive data={[]} />
          </div>

          {/* --- 6. OPERATIONAL AUDIT: Information Scent --- */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-4 px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">Deep-Node Resolution Density</h2>
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
               <OperationsDeepDive 
                  tasks={[]} 
                  tickets={[]} 
                  viewMode="admin" 
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}