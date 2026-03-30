import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  Building2, 
  Users, 
  Activity, 
  ShieldCheck, 
  Server, 
  Globe, 
  AlertTriangle,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function SuperAdminOverview() {
  const supabase = await createClient();

  // Fetch critical platform stats
  const [
    { count: tenantCount }, 
    { count: userCount }, 
    { data: gateways }, 
    { data: recentLogs },
    { data: settings },
    { count: criticalEvents }
  ] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("employees").select("*", { count: "exact", head: true }),
    supabase.from("gateways").select("*"),
    supabase.from("audit_logs").select("*, actor:employees(full_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("system_settings").select("key, value").in("key", ["system_uptime", "security_status"]),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }).ilike("action", "%PURGE%")
  ]);

  const uptime = settings?.find(s => s.key === "system_uptime")?.value || "N/A";
  const securityStatus = settings?.find(s => s.key === "security_status")?.value || "Unknown";

  const stats = [
    { label: "Active Tenants", value: tenantCount || 0, icon: Building2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Provisioned Users", value: userCount || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "System Uptime", value: String(uptime), icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Critical Events", value: `${criticalEvents || 0} Alert(s)`, icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
          Command <span className="text-orange-600">Center</span>
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium max-w-2xl px-1 italic border-l-2 border-orange-500 ml-1 pl-4">
          Global platform state, infrastructure health, and administrative audit streams.
        </p>
      </header>

      {/* Primary Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:scale-[1.02] transition-all overflow-hidden relative">
            <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity", stat.color)}>
                <stat.icon className="size-24 -mr-8 -mt-8" />
            </div>
            <div className={cn("inline-flex p-3 rounded-2xl mb-4", stat.bg, stat.color)}>
              <stat.icon className="size-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </section>

      {/* Infrastructure & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Infrastructure Nodes (Gateways) */}
        <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Server className="size-4 text-orange-500" />
                    Telephony Infrastructure Nodes
                </h3>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full uppercase tracking-tighter">Managed by SuperAdmin</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gateways?.map((gw) => (
                    <div key={gw.id} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-center justify-between hover:border-orange-200 transition-all shadow-sm group">
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                <Cpu className="size-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{gw.name}</p>
                                <p className="text-[10px] font-mono text-slate-400 uppercase">{gw.ip_address}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "size-2 rounded-full animate-pulse",
                                gw.status === "online" ? "bg-emerald-500" : "bg-rose-500"
                            )} />
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{gw.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-10 bg-slate-900 dark:bg-slate-800 rounded-[3rem] text-white relative overflow-hidden group">
                <Globe className="absolute -right-10 -bottom-10 size-64 opacity-5 group-hover:scale-110 transition-transform duration-700" />
                <div className="max-w-md relative z-10">
                    <h4 className="text-2xl font-black tracking-tight leading-tight uppercase italic underline decoration-orange-500 decoration-4 underline-offset-8">Global Routing Active</h4>
                    <p className="mt-4 text-sm text-slate-400 font-medium">Platform nodes are currently syncing across 3 regions. GSM handshakes are simulated for dev validation.</p>
                </div>
            </div>
        </section>

        {/* Audit Stream */}
        <section className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                <Activity className="size-4 text-orange-500" />
                Live Audit Stream
            </h3>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-100/50 dark:shadow-none p-2">
                {recentLogs?.map((log, idx) => (
                    <div key={log.id} className={cn(
                        "p-5 rounded-2xl flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-50 last:border-0",
                        idx === 0 && "bg-orange-50/30 dark:bg-orange-900/10 border-orange-100/50"
                    )}>
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm">
                            <Activity className={cn(
                                "size-3.5",
                                log.action.includes("CREATE") ? "text-emerald-500" : "text-blue-500"
                            )} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase leading-none truncate">
                                {log.action.replace(/_/g, " ")}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1 font-medium italic">
                                by {log.actor?.full_name || "System"} • {new Date(log.created_at).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                
                <button className="w-full py-4 text-[9px] font-black uppercase text-slate-400 hover:text-orange-500 tracking-widest transition-colors flex items-center justify-center gap-2">
                    View Full System Integrity Logs
                    <AlertTriangle className="size-3" />
                </button>
            </div>
        </section>
      </div>
    </div>
  );
}
