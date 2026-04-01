'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, Cpu, Database, ShieldAlert, 
  Zap, Terminal, Lock, HardDrive 
} from 'lucide-react';

export default function ServerAdminView({ initialHealth }: any) {
  const [health, setHealth] = useState(initialHealth);

  // Live Jitter Simulation for Latency
  useEffect(() => {
    const interval = setInterval(() => {
      setHealth((prev: any) => ({
        ...prev,
        api_latency: `${Math.floor(18 + Math.random() * 12)}ms`,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'API Latency', value: health.api_latency, icon: Zap, color: 'text-primary' },
    { label: 'CPU Cluster', value: `${health.cpu_usage}%`, icon: Cpu, color: 'text-rose-500' },
    { label: 'RAM Allocation', value: `${health.memory_usage}%`, icon: Activity, color: 'text-emerald-500' },
    { label: 'DB Pool', value: health.active_db_connections, icon: Database, color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-12">
      
      {/* --- CONTROL HEADER --- */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl">
            <Terminal size={24} />
          </div>
          <div>
             <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Node Control</h2>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Nairobi / af-south-1 / Production</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
          <Lock size={14} /> Emergency Shutdown
        </button>
      </div>

      {/* --- METRIC GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/50 transition-all hover:shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <p className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">{stat.label}</p>
              <stat.icon size={20} className={`${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </div>
            <p className={`text-5xl font-black tracking-tighter ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* --- LOG CONSOLE (TERMINAL) --- */}
      <div className="relative group overflow-hidden rounded-[3.5rem] shadow-2xl border border-slate-800 bg-[#050505]">
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20" />
        
        <div className="p-10">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <ShieldAlert className="text-primary" size={20} />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.5em]">Global Audit Buffer</h3>
            </div>
          </div>

          <div className="h-[500px] overflow-y-auto font-mono text-[11px] space-y-1.5 custom-scrollbar pr-4">
            {health.logs.map((log: any, i: number) => (
              <div key={i} className="py-2 px-4 flex flex-wrap lg:flex-nowrap gap-4 hover:bg-white/5 rounded-xl transition-all group">
                <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                <span className="text-blue-500/80 font-black shrink-0 w-36 truncate uppercase tracking-widest border-r border-white/10 pr-4">
                  {log.service}
                </span>
                <span className={`font-black shrink-0 w-16 text-center rounded px-1.5 py-0.5 ${
                  log.level === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 
                  log.level === 'WARN' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
                }`}>
                  {log.level}
                </span>
                <span className="text-slate-300 tracking-tight flex-1 uppercase">
                  {log.message}
                </span>
              </div>
            ))}
            
            <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-4">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.4em] italic">
                Active Telemetry Stream • Securing af-south-1
              </span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}