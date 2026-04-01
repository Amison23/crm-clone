import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ServerAdminView from '@/app/ui/dashboard/analytics/components/SeverAdminView';

/**
 * INFRASTRUCTURE AUDIT NODE
 * Master Control Plane for af-south-1 telemetry.
 * Scoped to 'superadmin' role only.
 */
export default async function ServerAdminPage() {
  const supabase = await createClient();

  // 1. SECURITY PROTOCOL
  // Verifying Super Admin credentials before initializing the telemetry buffer.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'superadmin') {
    redirect('/protected'); 
  }


  // 2. TELEMETRY FETCH
  // We utilize the view_server_infrastructure_audit for cross-tenant visibility.
  const { data: metrics, error } = await supabase
    .from('view_server_infrastructure_audit')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(20);

  // Fallback for isolated or offline nodes
  if (error || !metrics || metrics.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-20 text-center space-y-6">
        <div className="size-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center animate-pulse">
           <span className="material-symbols-outlined text-4xl">sensors_off</span>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-[0.5em] text-slate-400">
          Telemetry Buffer Empty
        </h1>
        <p className="text-[10px] font-mono text-slate-500 uppercase italic">
          No active signals from af-south-1. Verify client_metrics table.
        </p>
      </div>
    );
  }

  // 3. DATA MAPPING: THE HEARTBEAT OBJECT
// 3. DATA MAPPING: Aligned with public.client_metrics
const latest = metrics[0];
const healthData = {
  uptime: '14d 02h 31m', 
  cpu_usage: latest.cpu_usage,    // Updated from latest.cpu
  memory_usage: latest.memory_usage, // Updated from latest.memory
  api_latency: '24ms', 
  active_db_connections: 12, 
  logs: metrics.map(m => {
    let level = 'INFO';
    if (m.cpu_usage > 85) level = 'CRITICAL';
    else if (m.cpu_usage > 70) level = 'WARN';

    return {
      timestamp: new Date(m.recorded_at).toLocaleTimeString('en-GB'),
      level,
      service: m.company_node.toUpperCase().replace(/\s+/g, '_'),
      message: `STATE: ${m.server_state.toUpperCase()} | CPU: ${m.cpu_usage}% | NET: ${m.network}kb/s`
    };
  })
};

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-24">
      
      {/* --- BREADCRUMBS --- */}
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
        <span className="opacity-50">Systems</span>
        <span className="opacity-20">/</span>
        <span className="text-primary">Infrastructure Audit</span>
      </div>

      <ServerAdminView initialHealth={healthData} />
      
      {/* --- NODE FOOTER --- */}
      <div className="pt-10 flex flex-col items-center gap-4 opacity-30 border-t border-slate-100 dark:border-slate-800">
         <p className="text-[10px] font-black uppercase tracking-[1.5em] text-slate-400">
           Global Node Plane v3.0
         </p>
         <div className="px-4 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
            <p className="text-[8px] font-mono uppercase italic tracking-tighter">
              Session Root: {user.id.slice(0, 18)}...
            </p>
         </div>
      </div>
    </div>
  );
}