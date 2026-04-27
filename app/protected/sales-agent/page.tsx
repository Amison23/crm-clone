import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  Activity, ChevronLeft, Target, Zap, 
  ShieldCheck, LayoutDashboard, TrendingUp, 
  Users, Briefcase, Clock, CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Intelligence Engine Components
import OperationsDeepDive from '@/app/ui/dashboard/analytics/components/OperationsDeepDive';

export default async function SalesAgentPage() {
  const supabase = await createClient();

  // 1. IDENTITY & ACL GATE (Strictly Agent-Scoped)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const agentId = user.id;
  const agentName = user.user_metadata?.full_name || "Agent Operator";
  const tenantId = user.user_metadata?.tenant_id;

  // 2. PARALLEL DATA FETCHING (Personal Scoping)
  const [tasksReq, ticketsReq, leadsReq, dealsReq] = await Promise.all([
    // Operational Tasks assigned to THIS agent
    supabase.from('tasks').select('*').eq('assigned_to', agentId).order('due_date', { ascending: true }),
    // Support Tickets assigned to THIS agent
    supabase.from('tickets').select('*').eq('assigned_to', agentId),
    // CRM: Every lead assigned to this agent (for Win Rate math)
    supabase.from('leads').select('*').eq('employee_id', agentId),
    // Financial: Won deals only
    supabase.from('deals').select('amount').eq('assigned_to', agentId).eq('status', 'won')
  ]);

  // 3. PERSONAL TELEMETRY TRANSFORMATIONS
  const allLeads = leadsReq.data || [];
  const activeLeads = allLeads.filter(l => l.status !== 'won' && l.status !== 'lost');
  const wonLeads = allLeads.filter(l => l.status === 'won').length;
  const totalClosed = allLeads.filter(l => l.status === 'won' || l.status === 'lost').length;
  
  // Win Rate Calculation (Section 5.1)
  const winRate = totalClosed > 0 ? Math.round((wonLeads / totalClosed) * 100) : 0;
  
  // Revenue Yield
  const settledRevenue = (dealsReq.data || []).reduce((sum, d) => sum + Number(d.amount), 0);

  // Task Velocity Math (Section 5.2)
  const totalTasks = tasksReq.data?.length || 0;
  const completedTasks = tasksReq.data?.filter(t => t.status === 'completed').length || 0;
  const taskVelocity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Mapping for OperationsDeepDive Component
  const myTasks = (tasksReq.data || []).map(t => ({
    id: t.id,
    name: t.title,
    assigned_to: agentName,
    deadline: new Date(t.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    met: t.status === 'completed' ? 1 : 0,
    objectives: 1,
    team: [agentName]
  }));

  const myTickets = (ticketsReq.data || []).map(t => ({
    name: t.title,
    assigned_to: agentName,
    initiation: new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    resolution: (t.status === 'resolved' || t.status === 'closed') ? 'Resolved' : 'Pending'
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 lg:p-10">
      <div className="w-full space-y-10 animate-in fade-in duration-1000">
        
        {/* --- TIER 1: PERSONAL NODE HEADER --- */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <LayoutDashboard size={140} className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <Link href="/protected/executive-dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.2em] transition-all group">
              <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
              Switch to Global View
            </Link>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <h2 className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.5em]">Active Agent Session</h2>
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                Agent <span className="text-primary italic">Node</span>
              </h1>
              <p className="text-slate-500 font-medium italic mt-2">Operator ID: <span className="text-slate-900 dark:text-white font-bold not-italic">{agentName}</span></p>
            </div>
          </div>

          {/* QUICK PERFORMANCE VITALS */}
          <div className="grid grid-cols-2 gap-4 relative z-10">
             <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center min-w-[140px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Personal Win Rate</p>
                <p className="text-3xl font-black text-primary tracking-tighter">{winRate}%</p>
             </div>
             <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center min-w-[140px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Settled Yield</p>
                <p className="text-2xl font-black text-emerald-500 tracking-tighter uppercase leading-none">
                   {new Intl.NumberFormat('en-KE').format(settledRevenue)}
                </p>
                <span className="text-[8px] font-black text-emerald-600 opacity-50 uppercase tracking-widest">KES</span>
             </div>
          </div>
        </header>

        {/* --- TIER 2: ANALYTICAL & TASK SECTION --- */}
        <div className=" gap-8">
           
           {/* LEFT: PERSONAL THROUGHPUT & SECURITY */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* Task Velocity Card */}
              <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[280px]">
                <div className="flex justify-between items-start">
                   <div className="p-3 bg-primary/10 text-primary rounded-2xl"><CheckCircle size={22}/></div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Objective Speed</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Node Optimal</p>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Completion Velocity</p>
                   <div className="flex items-baseline gap-2">
                      <h3 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{taskVelocity}%</h3>
                      <TrendingUp size={20} className="text-emerald-500" />
                   </div>
                </div>
              </div>

              {/* CRM Snippet: Active Pipeline */}
              <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                 <div className="flex items-center gap-3 mb-6">
                    <Briefcase className="text-primary" size={20} />
                    <h3 className="font-black uppercase tracking-tighter text-slate-900 dark:text-white">Personal Pipeline</h3>
                 </div>
                 <div className="space-y-3">
                    {activeLeads.slice(0, 3).map((lead: any) => (
                      <div key={lead.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-primary/30 transition-all cursor-default">
                         <div>
                            <p className="text-[11px] font-black uppercase text-slate-900 dark:text-white">{lead.first_name} {lead.last_name.charAt(0)}.</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{lead.status}</p>
                         </div>
                         <ArrowRight size={14} className="text-slate-300" />
                      </div>
                    ))}
                    {activeLeads.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic text-center py-4">No active leads assigned.</p>
                    )}
                 </div>
              </div>
           </div>
           </div>

           {/* RIGHT: RESOLUTION DEEP DIVE (Analytical) */}
           <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                 <div className="flex items-center gap-3">
                    <Target className="text-primary" size={20} />
                    <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Resolution Distribution</h3>
                 </div>
                 <div className="flex gap-4">
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase">Total Items</p>
                       <p className="text-lg font-black text-slate-900 dark:text-white">{totalTasks + myTickets.length}</p>
                    </div>
                 </div>
              </div>
              <div className="p-2 flex-1">
                 <OperationsDeepDive 
                    tasks={myTasks} 
                    tickets={myTickets} 
                    viewMode="agent" 
                 />
              </div>
           </div>


        {/* --- SYSTEM FOOTER --- */}
        <footer className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1em]">Agent Console v3.0</p>
              <div className="flex items-center gap-3">
                 <Zap size={12} className="text-primary" />
                 <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest italic tracking-tighter">
                   Identity verified via {tenantId?.slice(0, 8)} Node • Secure af-south-1 Encryption
                 </p>
              </div>
           </div>
        </footer>

      </div>
    </div>
  );
}

// Minimalist Internal Icon Component
function ArrowRight({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="3" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}