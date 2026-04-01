'use client';

import { useMemo } from 'react';
import { useIntelligence } from '@/hooks/useIntelligence';
import { 
  Activity, 
  Zap, 
  Users, 
  Target, 
  Layers, 
  ShieldCheck, 
  BarChart3,
  ChevronRight,
  TrendingUp,
  Database
} from 'lucide-react';
import { transformAgentData, transformPipelineData } from '@/utils/transformAgentData';

// Intelligence Engine Components
import SummaryCards from '@/app/ui/dashboard/analytics/components/SummaryCards';
import PerformanceDeepDive from '@/app/ui/dashboard/analytics/components/PerfomanceDeepDive';
import PipelineFunnel from '@/app/ui/dashboard/analytics/components/PipelineFunnel';
import TaskStats from '@/app/ui/dashboard/analytics/components/TaskStats';
import AgentReport from '@/app/ui/dashboard/analytics/components/AgentReport';
import SourceAnalytics from '@/app/ui/dashboard/analytics/components/SourceAnalytics';
import RevenueAuditTable from '@/app/ui/dashboard/analytics/components/RevenueAuditTable';
import { SummarySkeleton } from '@/app/ui/dashboard/analytics/components/SummarySkeleton';

export default function AnalyticsAndReporting() {
  const { intelligence, isLoading } = useIntelligence();

  // 1. DATA TRANSFORMATION LAYER
  // These utilities convert raw lead arrays into chart-ready objects
  const rawLeads = intelligence?.rawLeads || [];
  const funnelData = useMemo(() => transformPipelineData(rawLeads), [rawLeads]);
  const agentPerformance = useMemo(() => transformAgentData(rawLeads), [rawLeads]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 lg:p-10 space-y-12 pb-32 animate-in fade-in duration-1000">
      
      {/* --- MASTER COMMAND HEADER --- */}
      <header className="flex flex-col xl:flex-row justify-between items-center bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 dark:opacity-10 pointer-events-none">
          <Database size={140} />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
           <div className="h-16 w-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30 group cursor-pointer active:scale-95 transition-all">
             <Activity size={32} className="group-hover:rotate-12 transition-transform" />
           </div>
           <div>
             <div className="flex items-center gap-2 mb-1">
               <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Node Connection: Stable</p>
             </div>
             <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
               Intelligence <span className="text-primary italic">Node</span>
             </h1>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
               Infrastructure ID: {intelligence?.meta.nodeId || 'af-south-1'} • Context: {intelligence?.meta.tenantContext}
             </p>
           </div>
        </div>

        <div className="flex items-center gap-4 relative z-10 mt-6 xl:mt-0">
          <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
            Export Audit Trail
          </button>
        </div>
      </header>

      {/* --- SECTION 1: OPERATIONAL VITALS --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-6">
          <Zap className="w-4 h-4 text-primary animate-pulse" />
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Real-Time Vitals</h2>
        </div>
        {isLoading ? <SummarySkeleton /> : (
          <div className="space-y-10">
            <SummaryCards />
            <TaskStats productivity={intelligence?.productivity} />
          </div>
        )}
      </section>

      {/* --- SECTION 2: PERFORMANCE & PIPELINE --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2">
          {/* Daily Resolution Units (24h Snapshots) */}
          <PerformanceDeepDive data={intelligence?.trends || []} />
        </div>
        <div className="xl:col-span-1">
          <PipelineFunnel funnelData={funnelData} />
        </div>
      </div>

      {/* --- SECTION 3: YIELD & SOURCES --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Marketing ROI breakdown */}
        <SourceAnalytics data={intelligence?.sourceDistribution || []} />
        
        {/* Productivity Efficiency Card */}
        <div className="bg-primary p-12 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <ShieldCheck className="absolute -bottom-8 -right-8 w-48 h-48 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-blue-200" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Efficiency Intelligence</h3>
            </div>
            <h4 className="text-5xl font-black uppercase tracking-tighter leading-tight">
              Operational<br/>Throughput: {intelligence?.throughput?.productivity_yield || 0}%
            </h4>
          </div>
          <div className="relative z-10 pt-10 border-t border-white/10 mt-8">
            <p className="text-[11px] font-medium opacity-70 italic leading-relaxed max-w-sm">
              Node status: <span className="font-black not-italic text-white underline decoration-emerald-400 decoration-2">{intelligence?.throughput?.node_status || 'Optimal'}</span>. <br/>
              Current System Velocity: {intelligence?.throughput?.system_velocity} units/sec verified.
            </p>
          </div>
        </div>
      </div>

      {/* --- SECTION 4: AGENT PERFORMANCE --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-6">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Agent Throughput Hierarchy</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <AgentReport agents={agentPerformance} />
        </div>
      </section>

      {/* --- SECTION 5: FINANCIAL AUDIT (Section 5.1) --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Verified Acquisition Log (KES)</h3>
          </div>
          <button className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
            Full Audit Trail <ChevronRight size={12} />
          </button>
        </div>
        {/* Bug-fixed table with composite keys and defensive type casting */}
        <RevenueAuditTable data={intelligence?.revenueAudit || []} />
      </section>

      {/* --- SYSTEM FOOTER --- */}
      <footer className="py-20 flex flex-col items-center gap-4">
        <div className="h-[1px] w-32 bg-slate-200 dark:bg-slate-800" />
        <p className="text-[10px] font-black uppercase tracking-[1.5em] text-slate-300 dark:text-slate-700">
          Intelligence Engine v3.0
        </p>
        <div className="flex items-center gap-2">
           <Activity size={10} className="text-emerald-500" />
           <p className="text-[8px] font-mono text-slate-400 uppercase italic tracking-tighter">
             Secure Multi-Tenant Node af-south-1 • System Time: {new Date().toLocaleTimeString()}
           </p>
        </div>
      </footer>

    </div>
  );
}