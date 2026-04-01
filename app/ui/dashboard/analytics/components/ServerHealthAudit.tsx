'use client';

import { Activity, Server, Cpu, HardDrive, Network as NetworkIcon } from 'lucide-react';

export default function ServerHealthAudit({ metrics = [] }: { metrics: any[] }) {
  return (
    <div className="bg-[#0a0a0a] rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden p-1">
      <div className="p-8 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
            <Activity size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">Infrastructure Node Telemetry</h3>
            <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.3em]">Real-time Server State</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">
              <th className="px-8 py-5">Node Identity</th>
              <th className="px-8 py-5">State</th>
              <th className="px-8 py-5 text-center"><Cpu size={14} className="mx-auto mb-1" /> CPU</th>
              <th className="px-8 py-5 text-center"><Activity size={14} className="mx-auto mb-1" /> RAM</th>
              <th className="px-8 py-5 text-center"><HardDrive size={14} className="mx-auto mb-1" /> DISK</th>
              <th className="px-8 py-5 text-right"><NetworkIcon size={14} className="ml-auto mb-1" /> NET</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {metrics.map((node, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6">
                  <p className="text-xs font-black text-slate-200 uppercase tracking-widest">{node.company_node}</p>
                </td>
                <td className="px-8 py-6">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase border border-emerald-500/20">
                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" /> {node.server_state}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <p className={`text-sm font-mono font-bold ${node.cpu > 60 ? 'text-rose-500' : 'text-slate-300'}`}>{node.cpu}%</p>
                </td>
                <td className="px-8 py-6 text-center text-sm font-mono font-bold text-slate-300">{node.memory}%</td>
                <td className="px-8 py-6 text-center text-sm font-mono font-bold text-slate-300">{node.disk}%</td>
                <td className="px-8 py-6 text-right text-sm font-mono font-bold text-primary">{node.network} Mb/s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}