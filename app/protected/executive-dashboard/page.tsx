import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Target, 
  ChevronRight, 
  BarChart3, 
  Activity,
  Lock,
  TrendingUp,
  Zap,
  Briefcase,
  Layers
} from 'lucide-react';

// Intelligence Engine Components
import SummaryCards from '@/app/ui/dashboard/analytics/components/SummaryCards';
import AgentReport from '@/app/ui/dashboard/analytics/components/AgentReport';
import PerformanceDeepDive from '@/app/ui/dashboard/analytics/components/PerfomanceDeepDive';
import RevenueAuditTable from '@/app/ui/dashboard/analytics/components/RevenueAuditTable';
import SourceAnalytics from '@/app/ui/dashboard/analytics/components/SourceAnalytics';
import PipelineFunnel from '@/app/ui/dashboard/analytics/components/PipelineFunnel';

// Utilities
import { transformAgentData, transformPipelineData } from '@/utils/transformAgentData';

export default async function ExecutiveDashboard() {
  const supabase = await createClient();

  // 1. IDENTITY & ACL GATE (Section 1.2 & 6.3)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const tenantId = user.user_metadata?.tenant_id;
  const userRole = user.user_metadata?.role;

  // Security Protocol: Only Managerial roles (Merchant Pro Managers)
  if (userRole === 'sales_agent') redirect('/protected/agent-workspace');
  
  if (!tenantId) return <NodeIsolatedError />;

  // 2. PARALLEL BUSINESS DATA FETCHING (Section 1.3 & 5.0)
  const [
    companyReq, 
    leadsReq, 
    dealsReq,
    revenueAuditReq, 
    sourceDistReq,
    tasksReq, 
    ticketsReq, 
    trendsReq
  ] = await Promise.all([
    supabase.from('companies').select('*').eq('id', tenantId).single(),
    supabase.from('leads').select('*, employees(full_name)').eq('company_id', tenantId),
    supabase.from('deals').select('amount, status').eq('company_id', tenantId).eq('status', 'won'),
    supabase.from('view_detailed_revenue_audit').select('*').eq('company_id', tenantId).limit(10),
    supabase.from('view_lead_source_distribution').select('*').eq('company_id', tenantId),
    supabase.from('tasks').select('*').eq('company_id', tenantId),
    supabase.from('tickets').select('*').eq('company_id', tenantId),
    supabase.from('analytics_snapshots').select('*').eq('tenant_id', tenantId).order('recorded_at', { ascending: true })
  ]);

  // 3. BUSINESS LOGIC PROCESSING (Section 5.1 & 5.2)
  const rawLeads = leadsReq.data || [];
  const rawDeals = dealsReq.data || [];
  const snapshots = trendsReq.data || [];

  // Financial KPIs
  const settledYield = rawDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const potentialYield = rawLeads
    .filter(l => l.status !== 'won' && l.status !== 'lost')
    .reduce((sum, l) => sum + (Number(l.potential_value) || 0), 0);

  // Growth & Velocity Math
  const latestSnapshot = snapshots[snapshots.length - 1];
  const conversionVelocity = latestSnapshot?.conversion_rate || 0;
  const resolutionRate = ticketsReq.data?.length 
    ? Math.round((ticketsReq.data.filter(t => t.status === 'resolved').length / ticketsReq.data.length) * 100) 
    : 100;

  // Data Transformations for Charts
  const funnelData = transformPipelineData(rawLeads);
  const agentPerformance = transformAgentData(rawLeads);
  const performanceHistory = snapshots.map(s => ({
    date: new Date(s.recorded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    total: s.total_leads_count,
    closed: s.closed_leads_count,
    revenue: s.total_revenue_won,
    efficiency: s.conversion_rate
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] pb-32 font-sans">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-10 animate-in fade-in duration-1000">
        
        {/* --- TIER 1: BRANDED PRODUCT HEADER --- */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
            <Layers size={140} />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.5em]">Product Intelligence: {companyReq.data?.plan_type || 'Pro Node'}</h2>
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              {companyReq.data?.name || "Merchant Pro"} <span className="text-primary italic">Console</span>
            </h1>
            <p className="text-slate-500 font-medium italic text-lg max-w-xl">
              Strategic overview of lead conversion, agent throughput, and settled KES acquisitions.
            </p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Node ID</p>
               <p className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-tighter">
                  {tenantId.slice(0, 14)}...
               </p>
            </div>
            <button className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.03] transition-all">
              Export Audit Trail
            </button>
          </div>
        </header>

        {/* --- TIER 2: BUSINESS MODEL VITALS --- */}
    {/* --- TIER 2: BUSINESS MODEL VITALS --- */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  
  {/* 1. Settled Revenue - Using Emerald Theme */}
  <div className="p-6 lg:p-8 bg-emerald-600 text-white rounded-[2.2rem] shadow-xl group flex flex-col justify-between min-w-0">
    <div className="flex justify-between items-start mb-4">
      <TrendingUp className="opacity-40 group-hover:scale-110 transition-transform" size={22} />
      <span className="text-[8px] font-black bg-white/20 px-2 py-1 rounded-md uppercase tracking-widest">Audited</span>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 truncate">Settled Revenue</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-bold opacity-60">KES</span>
        <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tighter leading-none truncate">
          {new Intl.NumberFormat('en-KE').format(settledYield)}
        </h3>
      </div>
    </div>
  </div>

  {/* 2. Pipeline Value - Using Dark/Light Adaptive Theme */}
  <div className="p-6 lg:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.2rem] shadow-sm flex flex-col justify-between min-w-0">
    <Target className="text-primary mb-4" size={22} />
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 truncate">Pipeline Valuation</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-bold text-slate-400">KES</span>
        <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none truncate">
          {new Intl.NumberFormat('en-KE').format(potentialYield)}
        </h3>
      </div>
    </div>
  </div>

  {/* 3. Conversion Velocity */}
  <div className="p-6 lg:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.2rem] shadow-sm flex flex-col justify-between min-w-0">
    <Zap className="text-amber-500 mb-4" size={22} />
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 truncate">Conv. Velocity</p>
      <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
        {conversionVelocity}<span className="text-lg ml-0.5 opacity-40">%</span>
      </h3>
    </div>
  </div>

  {/* 4. SLA Support Efficiency */}
  <div className="p-6 lg:p-8 bg-slate-900 text-white rounded-[2.2rem] border border-slate-800 flex flex-col justify-between min-w-0">
    <BarChart3 className="text-blue-400 mb-4" size={22} />
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1 truncate">SLA Resolution</p>
      <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tighter leading-none">
        {resolutionRate}<span className="text-lg ml-0.5 opacity-40">%</span>
      </h3>
    </div>
  </div>
</div>

        {/* --- TIER 3: REVENUE & PIPELINE ANALYTICS (Section 5.0) --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2">
            <PerformanceDeepDive data={performanceHistory} />
          </div>
          <div className="xl:col-span-1">
            <PipelineFunnel funnelData={funnelData} />
          </div>
        </div>

        {/* --- TIER 4: ACQUISITION & SOURCE AUDIT --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-8">
             <RevenueAuditTable data={revenueAuditReq.data || []} />
          </div>
          <div className="xl:col-span-4">
             <SourceAnalytics data={sourceDistReq.data || []} />
          </div>
        </div>

        {/* --- TIER 5: AGENT PRODUCTIVITY HIERARCHY --- */}
        <section className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <ShieldCheck size={24} />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white italic">Agent Throughput Audit</h2>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Sales Nodes</p>
                 <p className="text-xl font-bold text-slate-900 dark:text-white">{agentPerformance.length}</p>
              </div>
           </div>
           <AgentReport agents={agentPerformance} />
        </section>

      </div>
    </div>
  );
}

// Error Boundary for Tenant Isolation Failure
function NodeIsolatedError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-10 text-center">
      <div className="max-w-md space-y-6 bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border-2 border-dashed border-rose-100">
        <Lock size={64} className="mx-auto text-rose-500 animate-pulse mb-2" />
        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Security Loop Isolated</h1>
        <p className="text-slate-500 text-sm italic">Multi-tenant context missing. Access denied to Merchant Pro analytics node.</p>
        <Link href="/login" className="block w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]">Re-Validate Session</Link>
      </div>
    </div>
  );
}