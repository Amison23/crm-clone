import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, Target, BarChart3, Lock, 
  TrendingUp, Zap, Layers, ArrowRight 
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

  // 1. IDENTITY & ACL GATE
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let tenantId = user.user_metadata?.tenant_id;
  let userRole = user.user_metadata?.role;

  // Fallback to employees table if metadata is missing
  if (!tenantId || !userRole) {
    const { data: employee } = await supabase
      .from('employees')
      .select('role, company_id')
      .eq('id', user.id)
      .single();
    
    if (employee) {
      tenantId = tenantId || employee.company_id;
      userRole = userRole || employee.role;
    }
  }

  if (userRole === 'sales_agent') redirect('/protected/sales-agent');
  
  if (!tenantId) {
    // For presentation purposes, if no tenant is linked, try to get the first company
    const { data: firstCompany } = await supabase.from('companies').select('id').limit(1).single();
    if (firstCompany) {
      tenantId = firstCompany.id;
    } else {
      return <NodeIsolatedError />;
    }
  }

  const { data: company } = await supabase
    .from('companies')
    .select('name, plan_type')
    .eq('id', tenantId)
    .single();

const companyName = company?.name?.trim();
  console.log("Company Name for Filtering:", companyName);  

  // 2. PARALLEL BUSINESS DATA FETCHING (Updated with Expansive Audit View)
  const [
    companyReq, 
    leadsReq, 
    dealsReq,
    revenueAuditReq, // 🎯 TARGET QUERY UPDATED
    sourceDistReq,
    tasksReq, 
    ticketsReq, 
    trendsReq
  ] = await Promise.all([
    supabase.from('companies').select('*').eq('id', tenantId).single(),
    supabase.from('leads').select('*, employees(full_name)').eq('company_id', tenantId),
    supabase.from('deals').select('amount, status').eq('company_id', tenantId).eq('status', 'won'),
    
    // Updated to expansive view with limit 10
supabase.from('view_expansive_revenue_audit')
    .select('*')
    .eq('company_id', tenantId) // ⚡ Direct UUID hit
    .order('timestamp', { ascending: false })
    .limit(10),

    supabase.from('view_lead_source_distribution').select('*').eq('company_id', tenantId),
    supabase.from('tasks').select('*').eq('company_id', tenantId),
    supabase.from('tickets').select('*').eq('company_id', tenantId),
    supabase.from('analytics_snapshots').select('*').eq('tenant_id', tenantId).order('recorded_at', { ascending: true })
  ]);

  if (companyReq.error) console.error("Executive Dashboard - Error fetching company:", companyReq.error);
  if (leadsReq.error) console.error("Executive Dashboard - Error fetching leads:", leadsReq.error);
  if (dealsReq.error) console.error("Executive Dashboard - Error fetching deals:", dealsReq.error);
  if (revenueAuditReq.error) console.error("Executive Dashboard - Error fetching revenue audit:", revenueAuditReq.error);
  if (sourceDistReq.error) console.error("Executive Dashboard - Error fetching source distribution:", sourceDistReq.error);
  if (tasksReq.error) console.error("Executive Dashboard - Error fetching tasks:", tasksReq.error);
  if (ticketsReq.error) console.error("Executive Dashboard - Error fetching tickets:", ticketsReq.error);
  if (trendsReq.error) console.error("Executive Dashboard - Error fetching trends:", trendsReq.error);

  console.log("Fetched Revenue Audit Data:", revenueAuditReq.data); // Debug log for audit data

  // 3. BUSINESS LOGIC PROCESSING
  const rawLeads = leadsReq.data || [];
  const rawDeals = dealsReq.data || [];
  const rawTasks = tasksReq.data || [];
  const snapshots = trendsReq.data || [];

  // Financial KPI Aggregation
  const settledYield = rawDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const latestSnapshot = snapshots[snapshots.length - 1];
  const conversionVelocity = latestSnapshot?.conversion_rate || 0;
  
  // Operational Metrics
  const completedTasks = rawTasks.filter(t => t.status === 'completed').length;
  const overdueTasks = rawTasks.filter(t => 
    t.status !== 'completed' && new Date(t.due_date) < new Date()
  ).length;

  // Transformations
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] pb-12 font-sans">
      <div className="w-full p-4 lg:p-6 space-y-6">
        
        {/* --- TIER 1: HEADER --- */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none text-primary">
            <Layers size={140} />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <h2 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Product Intelligence: {companyReq.data?.plan_type || 'Pro Node'}</h2>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
              {companyReq.data?.name || "Merchant Pro"} <span className="text-primary italic">Console</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm max-w-xl">
              Strategic overview of lead conversion and expansive financial settlements.
            </p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-right">Node ID</p>
               <p className="text-xs font-mono font-medium text-slate-900 dark:text-white uppercase">
                  {tenantId?.slice(0, 14)}...
               </p>
            </div>
            <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
              Export Audit Trail
            </button>
          </div>
        </header>

        {/* --- TIER 2: BUSINESS MODEL VITALS --- */}
        <section className="relative z-30">
          <SummaryCards 
            sales={{
              totalLeads: rawLeads.length,
              totalRevenue: settledYield,
              conversionRate: `${conversionVelocity}%`
            }}
            productivity={{
              totalTasks: rawTasks.length,
              completedTasks: completedTasks,
              overdueTasks: overdueTasks
            }}
            nodeId={tenantId}
          />
        </section>

        {/* --- TIER 3: REVENUE & PIPELINE ANALYTICS --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PerformanceDeepDive data={performanceHistory} />
          </div>
          <div className="xl:col-span-1">
            <PipelineFunnel funnelData={funnelData} />
          </div>
        </div>

        {/* --- TIER 4: ACQUISITION & EXPANSIVE SOURCE AUDIT --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
             {/* 🎯 Data from view_expansive_revenue_audit flows here */}
             <RevenueAuditTable data={revenueAuditReq.data || []} />
          </div>
          <div className="xl:col-span-4">
             <SourceAnalytics data={sourceDistReq.data || []} />
          </div>
        </div>

        {/* --- TIER 5: AGENT PRODUCTIVITY --- */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <ShieldCheck size={20} />
                 </div>
                 <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Agent Throughput Audit</h2>
              </div>
           </div>
           <AgentReport agents={agentPerformance} />
        </section>

      </div>
    </div>
  );
}

// Minimal Error State
function NodeIsolatedError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-10 text-center font-sans">
      <div className="max-w-md space-y-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-rose-200 dark:border-rose-900/50">
        <Lock size={48} className="mx-auto text-rose-500 mb-2" />
        <h1 className="text-xl font-bold uppercase tracking-tight">Security Loop Isolated</h1>
        <p className="text-slate-500 text-sm italic">Multi-tenant context missing. Access denied to Merchant Pro analytics node.</p>
        <Link href="/login" className="block w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]">Re-Validate Session</Link>
      </div>
    </div>
  );
}