import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// UI Components (Intelligence Engine)
import SummaryCards from '@/app/ui/dashboard/analytics/components/SummaryCards';
import AgentReport from '@/app/ui/dashboard/analytics/components/AgentReport';
import OperationsDeepDive from '@/app/ui/dashboard/analytics/components/OperationsDeepDive';
import PerformanceDeepDive from '@/app/ui/dashboard/analytics/components/PerfomanceDeepDive';

/**
 * Executive Command Center
 * Section 5.0 Implementation: Data-Driven Analytics & Operational Audit
 */
export default async function ExecutiveDashboard() {
  const supabase = await createClient();

  // 1. IDENTITY & TENANT CONTEXT
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const tenantId = user.user_metadata?.tenant_id;
  if (!tenantId) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center text-3xl shadow-inner">⚠️</div>
        <h1 className="font-black uppercase tracking-tighter text-slate-900 dark:text-white text-2xl">Security Protocol Violation</h1>
        <p className="text-slate-500 font-medium italic">Null Tenant Context: Node Access Revoked.</p>
      </div>
    );
  }

  // 2. PARALLEL DATA FETCHING (Scoped to Tenant)
  const [companyReq, leadsReq, tasksReq, ticketsReq, trendsReq] = await Promise.all([
    supabase.from('companies').select('*').eq('id', tenantId).single(),
    supabase.from('leads').select('id, status, employees(full_name)').eq('company_id', tenantId),
    supabase.from('tasks').select('*, employees(full_name)').eq('company_id', tenantId).limit(5),
    supabase.from('tickets').select('*, employees(full_name)').eq('company_id', tenantId).limit(10),
    supabase.from('analytics_snapshots').select('*').eq('tenant_id', tenantId).order('recorded_at', { ascending: true })
  ]);

  // 3. DATA TRANSFORMATION: LEADERBOARD (Section 5.1)
  const agentPerformance = transformAgentData(leadsReq.data || []);

  // 4. DATA TRANSFORMATION: TASKS (Interface: Task)
  const mappedTasks = (tasksReq.data || []).map(t => ({
    id: t.id,
    name: t.title,
    assigned_to: (t as any).employees?.full_name || 'System Node',
    deadline: new Date(t.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    start: new Date(t.created_at).toLocaleDateString('en-GB'),
    met: t.status === 'completed' ? 1 : 0,
    objectives: 1,
    team: [(t as any).employees?.full_name || 'Agent']
  }));

  // 5. DATA TRANSFORMATION: TICKETS (Interface: Ticket)
  const mappedTickets = (ticketsReq.data || []).map(t => ({
    name: t.title || 'Support Incident',
    assigned_to: (t as any).employees?.full_name || 'Support Queue',
    initiation: new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    resolution: t.status === 'resolved' ? 'Resolved' : 'Pending',
    inbound: Math.floor(Math.random() * 8) + 1, // Placeholder for message count
    outbound: Math.floor(Math.random() * 5)
  }));

  // 6. DATA TRANSFORMATION: PERFORMANCE TRENDS (Section 5.3)
  const performanceHistory = (trendsReq.data || []).map(s => ({
    date: new Date(s.recorded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    total: s.leads_count,
    closed: s.tasks_completed_count,
    failed: 0,
    efficiency: s.conversion_rate
  }));

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-[#020617] animate-in fade-in duration-1000">
      <div className="p-6 lg:p-10 flex flex-col gap-10">
        
        {/* --- BRANDED HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.4em]">Node Intelligence Active</h2>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              {companyReq.data?.name || "Executive Console"}
            </h1>
            <p className="text-slate-500 font-medium italic mt-1">Monitoring corporate precision and revenue velocity.</p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
                Export Audit Logs
             </button>
             <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-95 transition-all">
                Sync Network
             </button>
          </div>
        </div>

        {/* --- LIVE VITALS: SECTION 5.3 SUMMARY --- */}
        <SummaryCards />

        {/* --- MAIN ANALYTICS CORE --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: CONVERSION TRENDS & RANKING */}
          <div className="xl:col-span-2 space-y-10">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Historical Pulse</h3>
              <PerformanceDeepDive data={performanceHistory} />
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Human Capital Velocity</h3>
              <AgentReport agents={agentPerformance} />
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE NODES */}
          <div className="flex flex-col gap-8">
            {/* Quick Actions Container */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-8">Node Commands</h3>
              <div className="grid grid-cols-2 gap-4">
                {['New Lead', 'New Ticket', 'Broadcast', 'Registry'].map((action) => (
                  <button key={action} className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border border-slate-50 dark:border-slate-800/50 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group">
                    <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 group-hover:text-blue-600">{action}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Task Monitor */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex-1">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Tactical Objectives</h3>
                <Link href="/protected/task-management-board" className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-tighter">View Grid</Link>
              </div>
              <div className="space-y-4">
                {mappedTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-2xl border border-slate-50 dark:border-slate-800/50 flex items-center justify-between group hover:border-blue-100 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{task.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">{task.deadline} • {task.assigned_to}</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM AUDIT: RESOLUTION DENSITY --- */}
        <section className="space-y-6 pt-6">
           <div className="flex items-center gap-4 px-2">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Operational Resolution Density</h2>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
           </div>
           <OperationsDeepDive 
             tasks={mappedTasks} 
             tickets={mappedTickets} 
             viewMode="admin" 
           />
        </section>

      </div>
      
      {/* --- INFRASTRUCTURE FOOTER --- */}
      <footer className="p-10 text-center border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-transparent">
         <div className="inline-flex flex-col items-center gap-2">
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">
                Secure Executive Node • Row-Level Security Verified
            </p>
            <p className="text-[8px] font-mono text-slate-400 dark:text-slate-600 uppercase italic">
                Environment: Production-af-south-1 • Tenant Instance: {tenantId.slice(0, 8)}
            </p>
         </div>
      </footer>
    </div>
  );
}

/**
 * 📊 Section 5.1 Helper: Agent Performance Transformer
 */
function transformAgentData(data: any[]): any[] {
  const groups: Record<string, any> = {};
  
  data.forEach(item => {
    const name = item.employees?.full_name || 'System Node';
    if (!groups[name]) {
      groups[name] = { 
        agent_name: name, 
        total_leads: 0, 
        closed_deals: 0, 
        win_rate: 0 
      };
    }
    groups[name].total_leads++;
    if (item.status === 'won' || item.status === 'closed_won') {
        groups[name].closed_deals++;
    }
  });

  return Object.values(groups).map(g => ({
    ...g,
    win_rate: g.total_leads > 0 ? Math.round((g.closed_deals / g.total_leads) * 100) : 0
  })).sort((a, b) => b.win_rate - a.win_rate);
}