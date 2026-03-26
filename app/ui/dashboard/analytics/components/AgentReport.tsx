'use client';

import { useState } from 'react';

interface AgentPerformance {
  agent_name: string;
  total_leads: number;
  closed_deals: number;
  win_rate: number;
  trend: number;
  precision_rate: number;
}

export default function AgentReport({ agents = [] }: { agents: AgentPerformance[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 dark:border-slate-800 flex justify-between items-end">
        <div>
          <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-xl">
            Human Capital <span className="text-blue-600">Velocity</span>
          </h4>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Ranking agents by conversion precision and lead throughput.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
           <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Live Audit</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest bg-gray-50/50 dark:bg-slate-800/30">
              <th className="px-8 py-5">Rank & Agent Node</th>
              <th className="px-8 py-5 text-center">Acquisitions</th>
              <th className="px-8 py-5 text-center">Conversions</th>
              <th className="px-8 py-5 text-center">Win Rate</th>
              <th className="px-8 py-5 text-right">Performance Node</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {agents.length > 0 ? agents.map((agent, index) => (
              <tr key={agent.agent_name} className="group hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-gray-300 dark:text-slate-700 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {agent.agent_name}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase">
                        Active Lead Specialist
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center font-mono font-bold text-gray-600 dark:text-slate-400">
                  {agent.total_leads}
                </td>
                <td className="px-8 py-6 text-center font-mono font-bold text-emerald-600">
                  {agent.closed_deals}
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col items-center gap-1">
                     <span className="text-sm font-black text-gray-900 dark:text-white">{agent.win_rate}%</span>
                     <div className="w-16 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-1000" 
                          style={{ width: `${agent.win_rate}%` }}
                        />
                     </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-xl border ${
                    agent.win_rate >= 50 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {agent.win_rate >= 50 ? 'HIGH YIELD' : 'EVALUATING'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-20 text-center text-gray-300 italic text-sm">
                  No performance data recorded for this cycle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}