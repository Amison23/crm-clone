import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, 
  ShieldCheck, 
  Globe, 
  Zap, 
  AlertTriangle, 
  Terminal,
  TrendingUp,
  Server,
  Layers
} from 'lucide-react';

// Intelligence Node Utilities
import { transformPipelineData } from '@/utils/transformAgentData';

// Intelligence v3.0 Components
import SummaryCards from '@/app/ui/dashboard/analytics/components/SummaryCards';
import PerformanceDeepDive from '@/app/ui/dashboard/analytics/components/PerfomanceDeepDive';
import RevenueAuditTable from '@/app/ui/dashboard/analytics/components/RevenueAuditTable';
import PipelineFunnel from '@/app/ui/dashboard/analytics/components/PipelineFunnel';
import TenantTable from '@/app/ui/dashboard/analytics/components/TenantsTable';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SuperAdminCommandCenter() {
  const supabase = await createClient();

  // 1. AUTH & SESSION CHECK
  // Note: Layout already performs authoritative role check via database.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/protected'); 


  // 2. GLOBAL DATA AGGREGATION (Cross-Tenant Telemetry)
const [
    tenantsReq, 
    leadsReq, // 🎯 FIX APPLIED HERE
    revenueReq, 
    frictionReq, 
    unassignedReq, 
    trendsReq
  ] = await Promise.all([
    supabase.from('view_tenant_registry_master').select('*').order('created_at', { ascending: false }),
    
    // 🛡️ Added 'status' to the selection below:
    supabase.from('leads').select('id, potential_value, status'), 
    
    supabase.from('view_detailed_revenue_audit').select('*').limit(15),
    supabase.from('view_operational_audit').select('*').in('metric_type', ['FRICTION', 'DENSITY']),
    supabase.from('view_unassigned_routing_audit').select('*'),
    supabase.from('analytics_snapshots')
      .select('*') // Simplified for safety
      .order('recorded_at', { ascending: true })
  ]);

  if (tenantsReq.error) console.error("Super Admin Dashboard - Error fetching tenants:", tenantsReq.error);
  if (leadsReq.error) console.error("Super Admin Dashboard - Error fetching leads:", leadsReq.error);
  if (revenueReq.error) console.error("Super Admin Dashboard - Error fetching revenue:", revenueReq.error);
  if (frictionReq.error) console.error("Super Admin Dashboard - Error fetching operational audit:", frictionReq.error);
  if (unassignedReq.error) console.error("Super Admin Dashboard - Error fetching unassigned routing:", unassignedReq.error);
  if (trendsReq.error) console.error("Super Admin Dashboard - Error fetching trends:", trendsReq.error);
  // 3. TELEMETRY TRANSFORMATIONS (Platform-Wide Aggregation)
  const tenantData = (tenantsReq.data as any[]) || [];
  const snapshotData = (trendsReq.data as any[]) || [];
  
  // 🎯 CALC: Global Platform Metrics
  const totalPlatformRevenue = tenantData.reduce((sum, t) => sum + (Number(t.total_revenue) || 0), 0);
  const totalPlatformLeads = leadsReq.data?.length || 0;
  const avgConversion = snapshotData.length > 0 
    ? Math.round(snapshotData.reduce((sum, s) => sum + (Number(s.conversion_rate) || 0), 0) / snapshotData.length)
    : 0;

  // Prepare Chart Data
  const funnelData = transformPipelineData(leadsReq.data || []);
  const globalTrends = snapshotData.map(s => ({
    date: new Date(s.recorded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    total: s.total_leads_count || 0,
    closed: s.closed_leads_count || 0,
    ongoing: s.ongoing_leads_count || 0,
    failed: s.failed_leads_count || 0,
    revenue: Number(s.total_revenue_won || 0), 
    efficiency: Number(s.conversion_rate || 0)
  }));

  const frictionCount = (frictionReq.data || []).filter(t => t.metric_type === 'FRICTION').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 lg:p-10 space-y-12 pb-32 animate-in fade-in duration-1000">
      
      {/* ── GLOBAL COMMAND HEADER ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Platform Owner Access · Superadmin Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Global Control Plane
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
            Managing <span className="text-slate-900 dark:text-white font-bold">{tenantData.length} Provisioned Workspaces</span> across the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/protected/super-admin/audit-logs"
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            Audit Logs
          </Link>
          <Link
            href="/protected/super-admin/tenants"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
          >
            Manage Tenants
          </Link>
        </div>
      </header>

      {/* --- TIER 2: GLOBAL PERFORMANCE MATRIX --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-8">
          <Layers className="w-4 h-4 text-primary animate-pulse" />
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Aggregated Platform Vitals</h2>
        </div>
        <SummaryCards 
          sales={{
            totalRevenue: totalPlatformRevenue,
            totalLeads: totalPlatformLeads,
            conversionRate: `${avgConversion}%`
          }}
          productivity={{
            totalTasks: 0, // Calculated per tenant in directory below
            completedTasks: 0,
            overdueTasks: 0
          }}
          nodeId="GLOBAL-CLUSTER-01"
        />
      </section>

      {/* --- TIER 3: TACTICAL INTERVENTION (CRITICAL) --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-8 text-slate-400">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><AlertTriangle size={20} /></div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em]">High-Priority Interventions</h2>
          </div>
          <div className="flex gap-12">
             <div className="text-right">
               <p className="text-[9px] font-black uppercase tracking-widest mb-1">Global Friction</p>
               <p className="text-3xl font-black text-rose-500 tracking-tighter">{frictionCount}</p>
             </div>
             <div className="text-right">
               <p className="text-[9px] font-black uppercase tracking-widest mb-1">Unassigned Yield</p>
               <p className="text-3xl font-black text-amber-500 tracking-tighter">{unassignedReq.data?.length || 0}</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- TIER 4: PERFORMANCE & PIPELINE GRID --- */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2">
          <PerformanceDeepDive data={globalTrends} />
        </div>
        <div className="xl:col-span-1">
          <PipelineFunnel funnelData={funnelData} />
        </div>
      </section>

      {/* --- TIER 5: FINANCIAL SETTLEMENT --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-8">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><TrendingUp size={20} /></div>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Global Revenue Audit Trail (KES)</h2>
        </div>
        <RevenueAuditTable data={revenueReq.data || []} />
      </section>

      {/* --- TIER 6: TENANT REGISTRY --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-8">
          <div className="p-2 bg-primary/10 text-primary rounded-lg"><Server size={20} /></div>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Global Tenant Node Directory</h2>
        </div>
        <TenantTable tenants={tenantData} />
      </section>

      {/* --- SYSTEM FOOTER --- */}
      <footer className="pt-24 pb-12 flex flex-col items-center gap-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-black uppercase tracking-[2em] text-slate-300 dark:text-slate-700 ml-[2em]">Global Control Plane v3.0</p>
        <div className="flex items-center gap-2">
           <Terminal size={12} className="text-slate-400" />
           <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter italic">
             Secure Session: af-south-1 • Protocol: <span className="text-emerald-500 font-bold uppercase">Verified</span> • Node Time: <span suppressHydrationWarning>{new Date().toLocaleTimeString()}</span>
           </p>
        </div>
      </footer>
    </div>
  );
}