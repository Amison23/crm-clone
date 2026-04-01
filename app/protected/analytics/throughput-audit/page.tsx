'use client';

import { useIntelligence } from '@/hooks/useIntelligence';
import { Activity, AlertTriangle, Layers, Zap, Gauge } from 'lucide-react';

export default function ThroughputAuditPage() {
  const { intelligence } = useIntelligence();
  const metrics = intelligence?.throughput || { productivity_yield: 0, critical_friction: 0, queue_density: 0, system_velocity: 0 };

  const cards = [
    { label: 'Productivity Yield', val: `${metrics.productivity_yield}%`, desc: 'Efficiency Rating', icon: Gauge, color: 'text-emerald-500' },
    { label: 'Critical Friction', val: metrics.critical_friction, desc: 'Requires Immediate Audit', icon: AlertTriangle, color: 'text-rose-500' },
    { label: 'Queue Density', val: metrics.queue_density, desc: 'Current Processing Load', icon: Layers, color: 'text-blue-500' },
    { label: 'System Velocity', val: metrics.system_velocity, desc: 'Gross Node Output', icon: Zap, color: 'text-primary' }
  ];

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto animate-in slide-in-from-bottom-4 duration-1000">
      <header className="space-y-2">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Section 5.2: Node Throughput</h2>
        <h1 className="text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Platform <span className="text-primary italic">Velocity</span></h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <div key={i} className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all">
            <card.icon className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-5 ${card.color} group-hover:scale-110 transition-transform`} />
            <div className={`p-4 w-fit rounded-2xl bg-slate-50 dark:bg-slate-800/50 ${card.color} mb-8`}>
               <card.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <p className={`text-5xl font-black tracking-tighter ${card.color} leading-none mb-3`}>{card.val}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* DETAILED TRACE LOGS WOULD GO HERE */}
      <div className="bg-[#0a0a0a] p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-6">Live Throughput Trace Log</p>
         <div className="space-y-4 font-mono text-[11px] text-slate-400">
            <p><span className="text-slate-600">[SYNC]</span> Node af-south-1 velocity validated at {metrics.system_velocity} units/sec</p>
            <p><span className={`font-black ${metrics.critical_friction > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>[WARN]</span> Critical Friction detected in {metrics.critical_friction} active threads</p>
         </div>
      </div>
    </div>
  );
}