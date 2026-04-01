import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  Activity, 
  ShieldCheck, 
  Globe, 
  Zap, 
  AlertTriangle, 
  Layers,
  Terminal,
  TrendingUp
} from 'lucide-react';

// Intelligence v3.0 Components
import SummaryCards from '@/app/ui/dashboard/analytics/components/SummaryCards';
import PerformanceDeepDive from '@/app/ui/dashboard/analytics/components/PerfomanceDeepDive';
import TacticalAudit from '@/app/ui/dashboard/analytics/components/TacticalAudit';
import RevenueAuditTable from '@/app/ui/dashboard/analytics/components/RevenueAuditTable';
import PipelineFunnel from '@/app/ui/dashboard/analytics/components/PipelineFunnel';
import TenantTable from '@/app/ui/dashboard/analytics/components/TenantsTable';
import { transformPipelineData } from '@/utils/transformAgentData';

export default async function SuperAdminCommandCenter() {
  const supabase = await createClient();

  // 1. AUTH & ROLE ESCALATION
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;

  // Security Gate: Ensure only 'superadmin' string check
  if (!user || role !== 'superadmin') {
    redirect('/protected'); 
  }

  // 2. GLOBAL DATA AGGREGATION (Cross-Tenant)
  // FIX: Fetching from view_tenant_registry_master to get 'total_revenue' per node
  const [
    tenantsReq, 
    leadsReq, 
    revenueReq, 
    frictionReq, 
    unassignedReq, 
    trendsReq
  ] = await Promise.all([
    supabase.from('view_tenant_registry_master').select('*').order('created_at', { ascending: false }),
    supabase.from('leads').select('*'),
    supabase.from('view_detailed_revenue_audit').select('*').limit(15),
    supabase.from('view_operational_audit').select('*').in('metric_type', ['FRICTION', 'DENSITY']),
    supabase.from('view_unassigned_routing_audit').select('*'),
    supabase.from('analytics_snapshots').select('*').order('recorded_at', { ascending: true })
  ]);

  // 3. TELEMETRY TRANSFORMATIONS
  const globalLeads = leadsReq.data || [];
  const funnelData = transformPipelineData(globalLeads);
  
  // Aggregate Trends: X-Axis represents Daily Resolution Cycles (24h Units)
  const globalTrends = (trendsReq.data || []).map(s => ({
    date: new Date(s.recorded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    total: s.leads_count,
    closed: s.tasks_completed_count,
    failed: 0 // Placeholder for drop-off telemetry
  }));

  const frictionCount = (frictionReq.data || []).filter(t => t.metric_type === 'FRICTION').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 lg:p-10 space-y-12 pb-32 animate-in fade-in duration-1000">
      
      {/* --- TIER 1: GLOBAL COMMAND HEADER --- */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-slate-900 p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <Globe size={240} className="absolute -right-16 -bottom-16 text-primary opacity-5 rotate-12 pointer-events-none" />
        
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Platform Owner Access</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Global Sync Active</span>
            </div>
          </div>
          
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none">
            Global <span className="text-primary italic">Intelligence</span>
          </h1>
          <p className="text-slate-400 font-medium italic text-lg max-w-2xl leading-relaxed">
            Master Infrastructure Node. Auditing <span className="text-white font-bold">{tenantsReq.data?.length || 0} Authorized Workspaces</span> in af-south-1.
          </p>
        </div>

        <div className="flex gap-4 relative z-10">
          <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95">
            Network Health Logs
          </button>
          <button className="px-8 py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:border-primary transition-all active:scale-95">
            + Provision New Tenant
          </button>
        </div>
      </header>

      {/* --- TIER 2: TACTICAL INTERVENTION (CRITICAL) --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><AlertTriangle size={20} /></div>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">High-Priority Interventions</h2>
          </div>
          <div className="flex gap-10">
             <div className="text-right">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Friction</p>
               <p className="text-3xl font-black text-rose-500 tracking-tighter">{frictionCount}</p>
             </div>
             <div className="text-right">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Unassigned Yield</p>
               <p className="text-3xl font-black text-amber-500 tracking-tighter">{unassignedReq.data?.length || 0}</p>
             </div>
          </div>
        </div>
        <TacticalAudit 
          frictionData={frictionReq.data || []} 
          unassignedData={unassignedReq.data || []} 
        />
      </section>

      {/* --- TIER 3: PERFORMANCE DEEP DIVE --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2">
          {/* Labeling the X-Axis as Temporal Daily Units */}
          <PerformanceDeepDive data={globalTrends} />
        </div>
        <div className="xl:col-span-1">
          <PipelineFunnel funnelData={funnelData} />
        </div>
      </div>

      {/* --- TIER 4: FINANCIAL SETTLEMENT --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-8">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><TrendingUp size={20} /></div>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Global Revenue Audit Trail (KES)</h2>
        </div>
        {/* FIX: Passing the data to the defensive RevenueAuditTable */}
        <RevenueAuditTable data={revenueReq.data || []} />
      </section>

      {/* --- TIER 5: TENANT REGISTRY --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-8">
          <div className="p-2 bg-primary/10 text-primary rounded-lg"><Activity size={20} /></div>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Global Tenant Node Directory</h2>
        </div>
        {/* FIX: Tenants now include the calculated 'total_revenue' field */}
        <TenantTable tenants={tenantsReq.data || []} />
      </section>

      {/* SYSTEM FOOTER */}
      <footer className="pt-24 flex flex-col items-center gap-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-black uppercase tracking-[2em] text-slate-300 dark:text-slate-700">Global Control Plane v3.0</p>
        <div className="flex items-center gap-2">
           <Terminal size={12} className="text-slate-400" />
           <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter italic">
             Secure Session: af-south-1 • Protocol: <span className="text-emerald-500 font-bold">Verified</span>
           </p>
        </div>
      </footer>
    </div>
  );
}