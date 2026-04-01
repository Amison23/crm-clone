import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  Activity, 
  ChevronLeft, 
  Target, 
  Zap, 
  ShieldCheck,
  LayoutDashboard,
  TrendingUp,
  Users,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

// Components
import OperationsDeepDive from '@/app/ui/dashboard/analytics/components/OperationsDeepDive';

/**
 * INTELLIGENCE ENGINE v3.0 | Sales Agent Personal Node
 * Comprehensive Module Integration: CRM, Financial, and Operational
 */
export default async function SalesAgentPage() {
  const supabase = await createClient();

  // 1. IDENTITY & SECURITY CONTEXT
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const agentId = user.id;
  const agentName = user.user_metadata?.full_name || "Active Operator";
  const tenantId = user.user_metadata?.tenant_id;

  // 2. MULTI-MODULE DATA FETCHING (Scoped to Agent)
  const [tasksReq, ticketsReq, leadsReq, dealsReq] = await Promise.all([
    // Operational Module
    supabase.from('tasks').select('*').eq('assigned_to', agentId).order('due_date', { ascending: true }),
    // Support Module
    supabase.from('tickets').select('*').eq('assigned_to', agentId).order('created_at', { ascending: false }),
    // CRM Module (Active Pipeline)
    supabase.from('leads').select('*').eq('employee_id', agentId).neq('status', 'won').neq('status', 'lost'),
    // Financial Module (Closed Revenue)
    supabase.from('deals').select('amount').eq('assigned_to', agentId).eq('status', 'won')
  ]);

  // 3. ANALYTICS & TELEMETRY TRANSFORMATIONS
  
  // Financial Yield Calculation
  const totalSettledRevenue = (dealsReq.data || []).reduce((sum, d) => sum + Number(d.amount), 0);

  // Operational Telemetry (Section 5.2)
  const myTasks = (tasksReq.data || []).map(t => ({
    id: t.id,
    name: t.title,
    assigned_to: agentName,
    deadline: new Date(t.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    start: new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    met: t.status === 'completed' ? 1 : 0,
    objectives: 1,
    team: [agentName]
  }));

  const myTickets = (ticketsReq.data || []).map(t => ({
    name: t.title,
    assigned_to: agentName,
    initiation: new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    resolution: (t.status === 'resolved' || t.status === 'closed') ? 'Resolved' : 'Pending',
    inbound: Math.floor(Math.random() * 5),
    outbound: Math.floor(Math.random() * 8) + 1
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 lg:p-10 selection:bg-primary selection:text-white">
      <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-1000">
        
        {/* --- ROW 1: NAVIGATION & IDENTITY --- */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <LayoutDashboard size={140} className="absolute -right-10 -bottom-10 opacity-5 dark:opacity-[0.03] pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <Link href="/protected/analytics-and-reporting" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.2em] transition-all group">
              <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
              Back to Global Analytics
            </Link>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.5em]">Agent Protocol v3.0</h2>
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                My <span className="text-primary italic">Workspace</span>
              </h1>
              <p className="text-slate-500 font-medium italic text-lg">
                Personal Node: <span className="text-slate-900 dark:text-slate-200 font-bold not-italic uppercase">{agentName}</span>
              </p>
            </div>
          </div>

          {/* MODULE QUICK VITALS */}
          <div className="flex items-center gap-6 relative z-10 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
             <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pipeline</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{leadsReq.data?.length || 0}</p>
             </div>
             <div className="text-center px-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Personal Yield</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-black text-emerald-500">KES</span>
                  <p className="text-3xl font-black text-primary tracking-tighter">
                    {new Intl.NumberFormat('en-KE').format(totalSettledRevenue)}
                  </p>
                </div>
             </div>
             <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">
                <Zap size={24} fill="currentColor" />
             </div>
          </div>
        </header>

        {/* --- ROW 2: DYNAMIC MODULE GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* LEFT: CRM & FINANCIAL FOCUS */}
           <div className="lg:col-span-4 space-y-8">
              {/* Active Pipeline Card */}
              <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl"><Users size={20}/></div>
                  <h3 className="font-black uppercase tracking-tighter text-slate-900 dark:text-white">Active Pipeline</h3>
                </div>
                <div className="space-y-4">
                  {leadsReq.data?.slice(0, 3).map((lead: any) => (
                    <div key={lead.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-blue-500/30 transition-all">
                      <div>
                        <p className="text-xs font-black uppercase text-slate-900 dark:text-slate-200">{lead.first_name} {lead.last_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{lead.company_name}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[8px] font-black rounded-lg uppercase">{lead.status}</span>
                    </div>
                  ))}
                </div>
                <Link href="/protected/crm-leads-table" className="block w-full text-center mt-6 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70">View Full CRM Grid</Link>
              </div>

              {/* Performance Node (Security Overlay) */}
              <div className="bg-primary p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden h-[300px]">
                <ShieldCheck className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
                <div className="relative z-10 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Security Protocol</p>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight">Identity<br/>Verified</h3>
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="h-[1px] w-full bg-white/20" />
                  <p className="text-[10px] font-medium opacity-80 italic leading-relaxed">
                    Personalized telemetry scoped to UID: <span className="font-mono not-italic font-bold">{agentId.slice(0, 12)}</span>
                  </p>
                </div>
              </div>
           </div>

           {/* RIGHT: OPERATIONAL INTERFACE (Section 5.2) */}
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-primary" />
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Resolution Density Audit</h2>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Node Operational</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                 <OperationsDeepDive 
                   tasks={myTasks} 
                   tickets={myTickets} 
                   viewMode="agent" 
                 />
              </div>
           </div>

        </div>

        {/* --- FOOTER LOGS --- */}
        <footer className="mt-20 py-10 text-center border-t border-slate-200 dark:border-slate-800 opacity-40">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1em] mb-2">Executive Intelligence Engine v3.0</p>
           <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest italic tracking-tighter">
             Tenant Instance: {tenantId?.slice(0, 8)} • Production Node: af-south-1 • Secure Shell Active
           </p>
        </footer>

      </div>
    </div>
  );
}