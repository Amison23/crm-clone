import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ServerAdminView from '@/app/ui/dashboard/analytics/components/SeverAdminView';
import { StaffChatbot } from '@/components/server-admin/StaffChatbot';

/**
 * SERVER ADMIN & INFRASTRUCTURE AUDIT NODE
 * Master Control Plane for Org Infrastructure & System Health.
 * Accessible to 'server_admin' and 'superadmin' roles.
 */
export default async function ServerAdminPage() {
  const supabase = await createClient();

  // 1. SECURITY PROTOCOL & ROLE RESOLUTION
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  let role = user.user_metadata?.role;
  let companyId = user.user_metadata?.company_id;

  if (!role || !companyId) {
    const { data: employee } = await supabase
      .from('employees')
      .select('role, company_id')
      .eq('id', user.id)
      .single();

    if (employee) {
      role = role || employee.role;
      companyId = companyId || employee.company_id;
    }
  }

  // Authorization Check: Allow server_admin & superadmin
  if (role !== 'server_admin' && role !== 'superadmin' && role !== 'super_admin') {
    redirect('/protected');
  }

  // 2. ORG DATA & TELEMETRY FETCH
  const [companyReq, ticketsReq, tasksReq, employeesReq, metricsReq] = await Promise.all([
    companyId ? supabase.from('companies').select('name, is_active').eq('id', companyId).single() : Promise.resolve({ data: null }),
    companyId ? supabase.from('tickets').select('id, status', { count: 'exact' }).eq('company_id', companyId) : Promise.resolve({ data: [], count: 0 }),
    companyId ? supabase.from('tasks').select('id, status', { count: 'exact' }).eq('company_id', companyId) : Promise.resolve({ data: [], count: 0 }),
    companyId ? supabase.from('employees').select('id', { count: 'exact' }).eq('company_id', companyId) : Promise.resolve({ data: [], count: 0 }),
    supabase.from('view_server_infrastructure_audit').select('*').order('recorded_at', { ascending: false }).limit(20)
  ]);

  const metrics = metricsReq.data || [];
  const latest = metrics[0] || { cpu_usage: 24, memory_usage: 42, server_state: 'healthy', network: 128 };
  const companyName = companyReq.data?.name || "Assigned Org";

  const openTickets = (ticketsReq.data || []).filter(t => t.status !== 'resolved').length;
  const pendingTasks = (tasksReq.data || []).filter(t => t.status !== 'completed').length;
  const staffCount = employeesReq.count || 0;

  // Health data structure combining live database metrics & labeled simulated server telemetry
  const healthData = {
    uptime: '14d 02h 31m',
    cpu_usage: latest.cpu_usage ?? 24,
    memory_usage: latest.memory_usage ?? 42,
    api_latency: '24ms',
    active_db_connections: staffCount > 0 ? staffCount + 3 : 12,
    orgName: companyName,
    openTickets,
    pendingTasks,
    staffCount,
    logs: metrics.length > 0 ? metrics.map(m => {
      let level = 'INFO';
      if (m.cpu_usage > 85) level = 'CRITICAL';
      else if (m.cpu_usage > 70) level = 'WARN';

      return {
        timestamp: new Date(m.recorded_at).toLocaleTimeString('en-GB'),
        level,
        service: (m.company_node || companyName).toUpperCase().replace(/\s+/g, '_'),
        message: `STATE: ${m.server_state.toUpperCase()} | CPU: ${m.cpu_usage}% (simulated telemetry) | NET: ${m.network}kb/s`
      };
    }) : [
      {
        timestamp: new Date().toLocaleTimeString('en-GB'),
        level: 'INFO',
        service: companyName.toUpperCase().replace(/\s+/g, '_'),
        message: `STATE: ONLINE | OPEN TICKETS: ${openTickets} | PENDING TASKS: ${pendingTasks} | ACTIVE STAFF: ${staffCount}`
      }
    ]
  };

  return (
    <div className="p-6 md:p-10 w-full space-y-10 animate-in fade-in duration-700 pb-24">
      
      {/* --- BREADCRUMBS & ORG BANNER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            <span>Server Admin</span>
            <span>/</span>
            <span className="text-primary">{companyName} Node Health</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {companyName} <span className="text-primary italic">Org Telemetry</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase rounded-xl border border-emerald-200 dark:border-emerald-800">
            Node: Operational
          </span>
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-mono font-bold rounded-xl border border-primary/20">
            [Telemetry Mode: Live DB + Labeled Simulated Telemetry]
          </span>
        </div>
      </div>

      {/* --- ORG HEALTH METRIC DASHBOARD --- */}
      <ServerAdminView initialHealth={healthData} />

      {/* --- INTERNAL STAFF CHATBOT NODE --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">forum</span>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Staff Communication Chatbot
          </h2>
        </div>
        <StaffChatbot companyName={companyName} />
      </section>
      
      {/* --- NODE FOOTER --- */}
      <div className="pt-10 flex flex-col items-center gap-4 opacity-40 border-t border-slate-200 dark:border-slate-800">
         <p className="text-[10px] font-black uppercase tracking-[1.5em] text-slate-400">
           Server Admin Control Plane v3.0
         </p>
         <div className="px-4 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
            <p className="text-[8px] font-mono uppercase italic tracking-tighter">
              Assigned Org ID: {companyId || "Self-Managed"} | Root User: {user.id.slice(0, 14)}...
            </p>
         </div>
      </div>
    </div>
  );
}