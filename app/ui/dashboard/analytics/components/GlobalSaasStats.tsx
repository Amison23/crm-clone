'use client';

import { 
  Banknote, 
  Network, 
  Activity, 
  Server,
  ArrowUpRight
} from 'lucide-react';

// --- SAFE TYPESCRIPT INTERFACE ---
export interface SaaSPlatformData {
  total_mrr?: number;
  tenant_count?: number;
  active_users?: number;
  system_health_percentage?: number;
}

export default function GlobalSaaSStats({ data = {} }: { data: SaaSPlatformData }) {
  
  // Safe fallbacks for the UI
  const mrr = data.total_mrr || 0;
  const tenants = data.tenant_count || 0;
  const users = data.active_users || 0;
  const health = data.system_health_percentage || 99.9;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      
      {/* --- 1. GLOBAL MRR (FINANCIAL YIELD) --- */}
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm flex flex-col justify-between group transition-all hover:shadow-md hover:border-emerald-500/30">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600">
              <Banknote size={20} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
              <ArrowUpRight size={10} /> Live
            </div>
          </div>
          
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
            Global Platform MRR
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-emerald-600/50 uppercase">KES</span>
            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              {mrr.toLocaleString('en-KE')}
            </h3>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
            * Aggregated Tenant Yield
          </p>
        </div>
      </div>

      {/* --- 2. TOTAL TENANTS (MOUNTED NODES) --- */}
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm flex flex-col justify-between group transition-all hover:shadow-md hover:border-primary/30">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Network size={20} />
            </div>
          </div>
          
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
            Active Tenants
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              {tenants}
            </h3>
            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Instances</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
            * Isolated Environments
          </p>
        </div>
      </div>

      {/* --- 3. ACTIVE USERS (HUMAN CAPITAL) --- */}
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm flex flex-col justify-between group transition-all hover:shadow-md hover:border-blue-500/30">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600">
              <Activity size={20} />
            </div>
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
            Network Throughput
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              {users.toLocaleString()}
            </h3>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">Users</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
            * Cross-Tenant Activity
          </p>
        </div>
      </div>

      {/* --- 4. SYSTEM HEALTH (INFRASTRUCTURE) --- */}
      <div className="p-8 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-sm flex flex-col justify-between group transition-all hover:shadow-md relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-slate-800 rounded-2xl text-emerald-400">
              <Server size={20} />
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Optimal</span>
            </div>
          </div>
          
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
            Infrastructure Uptime
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-white tracking-tighter leading-none">
              {health}%
            </h3>
          </div>
          
          {/* Visual Health Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}