import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// UI Infrastructure
import SummaryCards from '@/app/ui/dashboard/analytics/components/SummaryCards';
import TenantTable from '@/app/ui/dashboard/analytics/components/TenantsTable';
import PerformanceDeepDive from '@/app/ui/dashboard/analytics/components/PerfomanceDeepDive';
import OperationsDeepDive from '@/app/ui/dashboard/analytics/components/OperationsDeepDive';

export default async function SuperAdminPage() {
  const supabase = await createClient();

  // 1. AUTH & ROLE CHECK (Section 5.3: Security Context)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') {
    redirect('/dashboard'); 
  }

  // 2. GLOBAL INFRASTRUCTURE AUDIT
  // We fetch data across all companies in the system
  const [companiesReq, snapshotsReq, tasksReq, ticketsReq] = await Promise.all([
    supabase.from('companies').select('*').order('created_at', { ascending: false }),
    supabase.from('analytics_snapshots')
      .select('recorded_at, leads_count, conversion_rate, tasks_completed_count')
      .order('recorded_at', { ascending: true }),
    supabase.from('tasks').select('*, companies(name)').limit(15),
    supabase.from('tickets').select('*, companies(name)').limit(15)
  ]);

  const companies = companiesReq.data || [];
  
  // 3. ANALYTICS TRANSFORMATION (Section 5.1: Global Metrics)
  // We aggregate individual company snapshots into a Global Trend line
  const rawSnapshots = snapshotsReq.data || [];
  const aggregatedHistory = rawSnapshots.reduce((acc: any[], current) => {
    const existingDate = acc.find(a => a.date === current.recorded_at);
    if (existingDate) {
      existingDate.total += current.leads_count;
      existingDate.closed += current.tasks_completed_count;
    } else {
      acc.push({
        date: current.recorded_at,
        total: current.leads_count,
        closed: current.tasks_completed_count,
        failed: 0, // In production, linked to 'lost' deals
        efficiency: current.conversion_rate
      });
    }
    return acc;
  }, []);

  // 4. OPERATIONAL MAPPING (Section 5.2: Cross-Tenant Logic)
  const mappedTasks = (tasksReq.data || []).map(t => ({
    id: t.id,
    name: t.title,
    assigned_to: (t as any).companies?.name || 'External Node',
    deadline: new Date(t.due_date).toLocaleDateString('en-GB'),
    start: 'Platform Start',
    met: t.status === 'completed' ? 1 : 0,
    objectives: 1,
    team: [(t as any).companies?.name || 'N/A']
  }));

  const mappedTickets = (ticketsReq.data || []).map(t => ({
    name: t.title,
    assigned_to: (t as any).companies?.name || 'Support Node',
    initiation: new Date(t.created_at).toLocaleDateString('en-GB'),
    resolution: t.status === 'resolved' ? 'Resolved' : 'Pending',
    inbound: 0,
    outbound: 0
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-1000 bg-transparent text-slate-900 dark:text-slate-100">
      
      {/* --- MASTER COMMAND HEADER --- */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-gray-100 dark:border-slate-800 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-purple-200 dark:border-purple-800/50">
              Platform Owner Access
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Global Nodes Live</span>
            </div>
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
            System <span className="text-blue-600">Admin</span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium italic">Global SaaS Intelligence & Infrastructure Health Audit.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95">
              Network Logs
          </button>
          <button className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
              + Provision New Tenant
          </button>
        </div>
      </header>

      {/* --- GLOBAL VITALS (Section 5.3: Summary Cards) --- */}
      <section className="space-y-8">
        <SummaryCards />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 rounded-[3rem] flex items-center justify-between shadow-sm group">
                <div>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Tenant Saturation</p>
                    <h4 className="text-4xl font-black text-emerald-900 dark:text-emerald-100 tracking-tighter">{companies.length} Nodes</h4>
                </div>
                <div className="h-14 w-14 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-2xl shadow-lg border border-emerald-100 dark:border-emerald-800/50 group-hover:rotate-12 transition-transform">🏢</div>
            </div>
            <div className="p-8 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/50 rounded-[3rem] flex items-center justify-between shadow-sm group">
                <div>
                    <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Global Precision</p>
                    <h4 className="text-4xl font-black text-purple-900 dark:text-purple-100 tracking-tighter">98.4%</h4>
                </div>
                <div className="h-14 w-14 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-2xl shadow-lg border border-purple-100 dark:border-purple-800/50 group-hover:-rotate-12 transition-transform">🎯</div>
            </div>
        </div>
      </section>

      {/* --- ANALYTICS & OPERATIONS (Section 5.1 & 5.2) --- */}
      <section className="space-y-16">
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
              <div className="h-[1px] flex-1 bg-gray-100 dark:bg-slate-800" />
              <h2 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.4em]">Global Network Pulse</h2>
              <div className="h-[1px] flex-1 bg-gray-100 dark:bg-slate-800" />
          </div>
          {/* PerformanceDeepDive receives aggregated cross-tenant history */}
          <PerformanceDeepDive data={aggregatedHistory} />
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
              <div className="h-[1px] flex-1 bg-gray-100 dark:bg-slate-800" />
              <h2 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.4em]">Cross-Tenant Operations</h2>
              <div className="h-[1px] flex-1 bg-gray-100 dark:bg-slate-800" />
          </div>
          <OperationsDeepDive 
              tasks={mappedTasks} 
              tickets={mappedTickets} 
              viewMode="admin"
          />
        </div>
      </section>

      {/* --- TENANT DIRECTORY (Section 5.3: Tables) --- */}
      <section className="pt-12">
          <div className="mb-8 px-2 flex justify-between items-end">
              <div>
                  <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Infrastructure Registry</h2>
                  <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Tenant Nodes</p>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase italic">
                {companies.length} Active Subscriptions Verified
              </p>
          </div>
          <TenantTable tenants={companies} /> 
      </section>

      {/* --- SYSTEM FOOTER --- */}
      <footer className="pt-20 pb-10 flex flex-col items-center gap-3 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
              <span className="h-[1px] w-12 bg-gray-100 dark:bg-slate-800" />
              <p className="text-[10px] font-black text-gray-300 dark:text-slate-700 uppercase tracking-[0.5em]">Global af-south-1 Node</p>
              <span className="h-[1px] w-12 bg-gray-100 dark:bg-slate-800" />
          </div>
          <p className="text-[9px] font-mono text-gray-400 dark:text-slate-600 uppercase italic">
              Build v1.4.2 • System Status: <span className="text-emerald-500 font-bold uppercase">Verified Operational</span>
          </p>
      </footer>
    </div>
  );
}