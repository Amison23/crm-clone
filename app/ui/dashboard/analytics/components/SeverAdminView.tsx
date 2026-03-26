// app/ui/dashboard/analytics/components/ServerAdminView.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ServerAdminView({ initialHealth }: any) {
  const [health, setHealth] = useState(initialHealth);

  useEffect(() => {
    const interval = setInterval(() => {
      setHealth((prev: any) => ({
        ...prev,
        api_latency: `${Math.floor(18 + Math.random() * 12)}ms`,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {['API Latency', 'CPU Cluster', 'RAM Allocation', 'Active DB Pool'].map((label, i) => (
          <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800/50">
            <p className="text-gray-400 uppercase text-[9px] font-black mb-4 tracking-[0.2em]">{label}</p>
            <p className="text-3xl font-black text-blue-600 tracking-tighter">
              {i === 0 ? health.api_latency : i === 1 ? health.cpu_usage : i === 2 ? health.memory_usage : health.active_db_connections}
            </p>
          </div>
        ))}
      </div>

      <div className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/5">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10" />
        <div className="bg-[#0a0a0a] p-10 h-[400px] overflow-y-auto font-mono text-[11px] text-gray-300">
           {health.logs.map((log: any, i: number) => (
             <div key={i} className="py-2 border-b border-white/5 flex gap-4">
               <span className="text-gray-600">[{log.timestamp}]</span>
               <span className="text-blue-500 font-black">{log.level}</span>
               <span>{log.message}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}