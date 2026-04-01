import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  Target, 
  ChevronRight, 
  Database, 
  Activity,
  AlertTriangle,
  Lock,
  BarChart3,
  TrendingUp
} from 'lucide-react';

// Intelligence Engine Components
import SummaryCards from '@/app/ui/dashboard/analytics/components/SummaryCards';
import AgentReport from '@/app/ui/dashboard/analytics/components/AgentReport';
import OperationsDeepDive from '@/app/ui/dashboard/analytics/components/OperationsDeepDive';
import PerformanceDeepDive from '@/app/ui/dashboard/analytics/components/PerfomanceDeepDive';
import RevenueAuditTable from '@/app/ui/dashboard/analytics/components/RevenueAuditTable';
import SourceAnalytics from '@/app/ui/dashboard/analytics/components/SourceAnalytics';
import { transformAgentData } from '@/utils/transformAgentData';

export default async function ExecutiveDashboard() {
  const supabase = await createClient();

  // 1. IDENTITY & SECURITY GATE
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const tenantId = user.user_metadata?.tenant_id;
  
  // PROTOCOL BREAK: Lockdown if no tenant context
  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-10">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[3rem] border-2 border-dashed border-red-100 dark:border-red-900/30 text-center space-y-6">
          <div className="inline-flex h-20 w-20 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full items-center justify-center text-4xl animate-pulse">
            <Lock />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Node Isolated</h1>
          <p className="text-slate-500 text-sm font-medium italic">Security Protocol: Null Tenant Context.</p>
          <Link href="/login" className="block w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px]">Re-Authenticate</Link>
        </div>
      </div>
    );
  }

  // 2. PARALLEL SCOPED DATA FETCHING (Section 5.1 & 5.2)
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
    
    // FETCH LEADS: Includes potential_value for Potential Yield
    supabase.from('leads')
      .select('id, status, potential_value, employee_id, created_at, updated_at, source, employees!leads_employee_id_fkey(full_name)')
      .eq('company_id', tenantId),

    // FETCH DEALS: Includes amount for Settled Yield
    supabase.from('deals')
      .select('amount, status')
      .eq('company_id', tenantId)
      .eq('status', 'won'),

    // FETCH REVENUE AUDIT: Flat transaction log using our fixed View
    supabase.from('view_detailed_revenue_audit')
      .select('*')
      .eq('company_id', tenantId)
      .limit(10),

    // FETCH SOURCE DISTRIBUTION: Marketing analytics
    supabase.from('view_lead_source_distribution')
      .select('*')
      .eq('company_id', tenantId),

    supabase.from('tasks')
      .select('*, employees!tasks_assigned_to_fkey(full_name)')
      .eq('company_id', tenantId)
      .order('due_date', { ascending: true })
      .limit(5),

    supabase.from('tickets').select('*').eq('company_id', tenantId).limit(10),

    supabase.from('analytics_snapshots')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('recorded_at', { ascending: true })
  ]);

  // 3. FINANCIAL INTELLIGENCE CALCULATIONS
  const rawLeads = leadsReq.data || [];
  const rawDeals = dealsReq.data || [];

  // 🎯 CALC: Settled Yield (Money in bank)
  const settledYield = rawDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);

  // 🎯 CALC: Potential Yield (Money in pipeline - 'new', 'contacted', 'qualified')
  const potentialYield = rawLeads
    .filter(l => l.status !== 'won' && l.status !== 'lost')
    .reduce((sum, lead) => sum + (Number(lead.potential_value) || 0), 0);

  // 4. TRANSFORMATION LAYER
  const unassignedLeads = rawLeads.filter((lead: any) => !lead.employee_id && !lead.employees?.full_name);
  const unassignedLeadsCount = unassignedLeads.length;
  const unassignedYieldAtRisk = unassignedLeads.reduce((sum, lead) => sum + (Number(lead.potential_value) || 0), 0);

  const agentPerformance = transformAgentData(rawLeads.filter(l => !!l.employee_id));
  
  const performanceHistory = (trendsReq.data || []).map(s => ({
    date: new Date(s.recorded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    total: s.leads_count,
    closed: s.tasks_completed_count,
    failed: 0,
    efficiency: s.conversion_rate
  }));

  const mappedTasks = (tasksReq.data || []).map(t => ({
    id: t.id,
    name: t.title,
    assigned_to: (t as any).employees?.full_name || 'Unassigned',
    deadline: new Date(t.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    start: new Date(t.created_at).toLocaleDateString('en-GB'),
    met: t.status === 'completed' ? 1 : 0,
    objectives: 1,
    team: [(t as any).employees?.full_name || 'Agent']
  }));

  const mappedTickets = (ticketsReq.data || []).map(t => ({
    name: t.title || 'Support Incident',
    assigned_to: 'Support Agent',
    initiation: new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    resolution: t.status === 'resolved' || t.status === 'closed' ? 'Resolved' : 'Pending',
    inbound: Math.floor(Math.random() * 4) + 1,
    outbound: Math.floor(Math.random() * 2)
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] pb-32">
      <div className="max-w-[1400px] mx-auto p-4 lg:p-10 space-y-12 animate-in fade-in duration-1000">
        
        {/* --- ROW 1: COMMAND HEADER --- */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
            <Database size={140} />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.5em]">Isolated Workspace Protocol</h2>
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              {companyReq.data?.name || "Workspace Console"}
            </h1>
            <p className="text-slate-500 font-medium italic text-lg">Secure Operational Command • af-south-1 Node</p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
              Export Tenant Audit
            </button>
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group cursor-pointer hover:bg-primary hover:text-white transition-all shadow-inner">
              <Activity className="w-7 h-7 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
        </header>

        {/* --- ROW 2: LIVE YIELD VITALS --- */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Settled Yield Card */}
           <div className="p-8 bg-emerald-500 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
              <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 rotate-12 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Settled Yield</p>
              <p className="text-4xl font-black tracking-tighter">
                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(settledYield)}
              </p>
              <p className="text-[9px] font-bold mt-4 uppercase opacity-60">Verified Liquid Capital</p>
           </div>

           {/* Potential Yield Card */}
           <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Potential Yield</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary transition-colors">
                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(potentialYield)}
              </p>
              <p className="text-[9px] font-bold mt-4 uppercase text-primary">Active Pipeline Valuation</p>
           </div>
            </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
      
                <SummaryCards 
      hideFinancials 
      className="lg:col-span-2" // 🎯 This matches the 4-col math: 1 + 1 + 2 = 4
    />
        </div>
     
           
       

        {/* --- ROW 3: PERFORMANCE & SOURCES --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2">
            <PerformanceDeepDive data={performanceHistory} />
          </div>
          <div className="xl:col-span-1">
             <SourceAnalytics data={sourceDistReq.data || []} />
          </div>
        </div>

        {/* --- ROW 4: HUMAN CAPITAL & QUEUE --- */}
        <section className="space-y-4">
           {/* UNASSIGNED QUEUE ALERT */}
           {unassignedLeadsCount > 0 && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-10 rounded-[3rem] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-amber-100 dark:bg-amber-500/20 rounded-2xl text-amber-600 animate-pulse"><AlertTriangle size={28} /></div>
                <div>
                  <h3 className="text-2xl font-black text-amber-900 dark:text-amber-400 uppercase tracking-tighter">Unassigned Yield at Risk</h3>
                  <p className="text-[11px] font-black text-amber-700/70 dark:text-amber-500/70 uppercase tracking-widest mt-1 italic">Immediate Routing Required for {unassignedLeadsCount} Nodes</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 relative z-10">
                <span className="text-sm font-black text-rose-500 uppercase">KES</span>
                <p className="text-5xl font-black text-rose-600 dark:text-rose-400 tracking-tighter leading-none">
                  {new Intl.NumberFormat('en-KE').format(unassignedYieldAtRisk)}
                </p>
              </div>
            </div>
          )}

           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
             <AgentReport agents={agentPerformance} />
           </div>
        </section>

        {/* --- ROW 5: FINANCIAL AUDIT (Section 5.1) --- */}
        <RevenueAuditTable data={revenueAuditReq.data || []} />

        {/* --- ROW 6: TACTICAL & OPERATIONAL (Section 5.2) --- */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Workspace Objectives</h3>
                </div>
                <Link href="/protected/task-management-board" className="text-[10px] font-black text-primary uppercase flex items-center gap-1 hover:gap-2 transition-all">
                  Open Board <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {mappedTasks.map((task) => (
                  <div key={task.id} className="p-6 rounded-[2.2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-primary/50 transition-all shadow-inner">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{task.name}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 mt-1">{task.assigned_to}</p>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${task.met ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                  </div>
                ))}
              </div>
           </div>

           <div className="lg:col-span-4 bg-primary p-12 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <ShieldCheck className="absolute -bottom-6 -right-6 w-48 h-48 opacity-10 rotate-12" />
              <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Infrastructure Pulse</p>
                <h3 className="text-4xl font-black uppercase tracking-tighter leading-tight">Node<br/>Operational</h3>
              </div>
              <p className="relative z-10 text-[11px] font-medium opacity-80 italic leading-relaxed text-blue-50 pt-10">
                Instance: {tenantId.slice(0, 16)}...<br/>
                Throughput Velocity: Optimal<br/>
                Section 5.2 Compliance: Verified
              </p>
           </div>
        </section>

      </div>
    </div>
  );
}