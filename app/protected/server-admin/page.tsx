import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ServerAdminView from '@/app/ui/dashboard/analytics/components/SeverAdminView';

/**
 * Infrastructure Audit Node
 * Fetches real-time telemetry from public.client_metrics
 */
export default async function ServerAdminPage() {
  const supabase = await createClient();

  // 1. SECURITY CHECK
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') {
    redirect('/dashboard');
  }

  // 2. TELEMETRY FETCH
  // We pull the latest 20 metric entries to populate the log buffer
  const { data: metrics, error } = await supabase
    .from('client_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !metrics || metrics.length === 0) {
    return (
      <div className="p-20 text-center opacity-30 font-black uppercase tracking-[0.5em]">
        No Telemetry Buffer Found
      </div>
    );
  }

  const latest = metrics[0];

  // 3. DATA MAPPING
  // Converting DB schema to the ServerHealth interface
  const healthData = {
    uptime: '14d 02h 31m', // This can be a hardcoded stat or calculated
    cpu_usage: `${latest.cpu_usage}%`,
    memory_usage: `${latest.memory_usage}%`,
    api_latency: '24ms', // Placeholder for the jitter logic
    active_db_connections: 12,
    logs: metrics.map(m => ({
      timestamp: new Date(m.created_at).toLocaleTimeString('en-GB'),
      level: m.cpu_usage > 85 ? 'CRITICAL' : m.cpu_usage > 70 ? 'WARN' : 'INFO',
      service: 'CORE_NODE_AF',
      message: `System State: ${m.server_state.toUpperCase()} | Net_Load: ${m.network_usage}kb/s`
    }))
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
      <ServerAdminView initialHealth={healthData} />
    </div>
  );
}