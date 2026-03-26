import { createClient } from '@/lib/supabase/server';
import OperationsDeepDive from '@/app/ui/dashboard/analytics/components/OperationsDeepDive';

/**
 * Global | Sales Agent Personal Workspace
 * Optimized for Section 5.1 & 5.2 metrics (Conversion & Resolution)
 */
export default async function SalesAgentPage() {
  const supabase = await createClient();

  // 1. AUTH CONTEXT
  const { data: { user } } = await supabase.auth.getUser();
  const agentName = user?.user_metadata?.full_name || "Agent Node"; 
  const agentId = user?.id;

  // 2. DATA FETCHING (Scoped to Agent via RLS)
  const [tasksReq, ticketsReq] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', agentId) // Corrected from assigned_to_id to match your schema
      .order('due_date', { ascending: true }),
    supabase
      .from('tickets')
      .select('*')
      .eq('assigned_to', agentId)
      .order('created_at', { ascending: false })
  ]);

  // 3. DATA TRANSFORMATION (Crucial for Section 5.2 Analytics)
  // Mapping raw database columns to your OperationsDeepDive Interface
  const myTasks = (tasksReq.data || []).map(t => ({
    id: t.id,
    name: t.title, // Mapping title -> name
    assigned_to: agentName,
    deadline: new Date(t.due_date).toLocaleDateString('en-GB'), // DD/MM/YYYY
    start: new Date(t.created_at).toLocaleDateString('en-GB'),
    met: t.status === 'completed' ? 1 : 0,
    objectives: 1,
    team: [agentName]
  }));

  const myTickets = (ticketsReq.data || []).map(t => ({
    name: t.title,
    assigned_to: agentName,
    initiation: new Date(t.created_at).toLocaleDateString('en-GB'),
    resolution: t.status === 'resolved' ? 'Resolved' : 'Pending', // Section 5.2 Status Logic
    inbound: 0, // Placeholder: Can be linked to a messages count query later
    outbound: 0
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">
      
      {/* --- PERSONALIZED HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 dark:border-slate-800 pb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-[0.3em]">
                Active Session
            </h2>
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
            Personal <span className="text-blue-600">Workspace</span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium italic mt-1 text-sm">
            Operational focus for <span className="font-black text-gray-900 dark:text-white">{agentName}</span>.
          </p>
        </div>

        {/* AGENT KPI MINI-STAT */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Objectives</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{myTasks.length}</p>
            </div>
            <div className="h-8 w-[1px] bg-gray-100 dark:bg-slate-800" />
            <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl">
                🚀
            </div>
        </div>
      </header>

      {/* --- OPERATIONAL VIEW: Section 5.2 Implementation --- */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 px-2">
          <h2 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap">
            Current Objectives & Support
          </h2>
          <div className="h-[1px] flex-1 bg-gray-100 dark:bg-slate-800" />
        </div>

        <OperationsDeepDive 
          tasks={myTasks} 
          tickets={myTickets} 
          viewMode="agent" 
        />
      </section>

      {/* --- SYSTEM FOOTER --- */}
      <footer className="pt-20 pb-10 text-center border-t border-gray-50 dark:border-slate-800">
        <div className="inline-flex flex-col items-center gap-2">
            <p className="text-[9px] font-black text-gray-300 dark:text-slate-700 uppercase tracking-[0.5em]">
                Secure Agent Environment • Global Core
            </p>
            <p className="text-[8px] font-mono text-gray-400 dark:text-slate-600 uppercase italic">
                Verified Identity: {agentId?.slice(0, 8)}...
            </p>
        </div>
      </footer>
    </div>
  );
}