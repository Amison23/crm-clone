'use client';

import { Trophy, AlertTriangle, Users, Minus, TrendingUp, Target } from 'lucide-react';

export interface AgentPerformance {
  agent_name: string;
  total_leads: number;
  closed_deals: number;
  win_rate: number;
}

export default function AgentReport({ agents = [] }: { agents: AgentPerformance[] }) {
  
  // Logic: Identify top performer and the baseline for the "Standard" range
  const maxWinRate = agents.length > 0 ? Math.max(...agents.map(a => a.win_rate)) : 0;
  
  return (
    <div className="w-full">
      {/* Mobile Cards (< md) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {agents.length > 0 ? agents.map((agent, index) => {
          const isTop = agent.win_rate === maxWinRate && agent.win_rate > 0;
          const isStruggling = agent.win_rate < 20 && agent.total_leads > 5;
          const isElite = agent.win_rate >= 50;

          return (
            <div key={agent.agent_name} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-xl font-black text-xs ${
                    isTop ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isTop ? <Trophy size={14} /> : String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{agent.agent_name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Certified Operator</p>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                  isTop ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                  isStruggling ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                  isElite ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {isTop ? 'Top Yield' : isStruggling ? 'Review' : isElite ? 'Elite' : 'Standard'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Leads</span>
                  <span className="font-mono font-black text-slate-900 dark:text-slate-100">{agent.total_leads}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Wins</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{agent.closed_deals}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Win Rate</span>
                  <span className="font-mono font-black text-amber-600">{agent.win_rate}%</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="p-8 text-center text-xs text-slate-400">
            Awaiting Operator Telemetry...
          </div>
        )}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-5">Rank & Agent Identity</th>
              <th className="px-6 py-5 text-center">Acquisitions</th>
              <th className="px-6 py-5 text-center">Conversions</th>
              <th className="px-6 py-5 text-center">Win Rate Precision</th>
              <th className="px-6 py-5 text-right">Performance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {agents.length > 0 ? agents.map((agent, index) => {
              
              // Semantic Status Logic
              const isTop = agent.win_rate === maxWinRate && agent.win_rate > 0;
              const isStruggling = agent.win_rate < 20 && agent.total_leads > 5;
              const isElite = agent.win_rate >= 50; // Elite threshold
              
              return (
                <tr key={agent.agent_name} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-300">
                  
                  {/* 1. RANK & IDENTITY */}
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-2xl font-black text-xs transition-transform group-hover:scale-110 ${
                        isTop 
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/50' 
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-transparent'
                      }`}>
                        {isTop ? <Trophy size={16} /> : String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                          {agent.agent_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${isTop ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                             Certified Operator
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. ACQUISITIONS */}
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-mono font-black text-lg text-slate-700 dark:text-slate-300 tracking-tighter">
                        {agent.total_leads}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Leads</span>
                    </div>
                  </td>

                  {/* 3. CONVERSIONS */}
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={`font-mono font-black text-lg tracking-tighter ${agent.closed_deals > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {agent.closed_deals}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Wins</span>
                    </div>
                  </td>

                  {/* 4. WIN RATE PRECISION (IMPROVED BAR) */}
                  <td className="px-6 py-6">
                    <div className="flex flex-col items-center gap-2 min-w-[140px]">
                       <div className="flex items-center gap-2 w-full justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isTop ? 'text-amber-600' : 'text-slate-500'}`}>
                            {agent.win_rate}%
                          </span>
                          <Target size={10} className="text-slate-300 dark:text-slate-700" />
                       </div>
                       <div className="w-full h-2 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-[2px]">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              isTop ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
                              isStruggling ? 'bg-rose-500' : 
                              isElite ? 'bg-emerald-500' : 'bg-primary'
                            }`} 
                            style={{ width: `${agent.win_rate}%` }}
                          />
                       </div>
                    </div>
                  </td>

                  {/* 5. STATUS BADGE */}
                  <td className="px-6 py-6 text-right">
                    <div className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] px-3 py-2 rounded-xl border-2 transition-all group-hover:scale-105 ${
                      isTop 
                        ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50 shadow-sm shadow-amber-500/10' 
                        : isStruggling
                        ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50'
                        : isElite
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'
                        : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                      {isTop && <Trophy size={10} className="animate-bounce" />}
                      {isStruggling && <AlertTriangle size={10} />}
                      {!isTop && !isStruggling && isElite && <TrendingUp size={10} />}
                      {!isTop && !isStruggling && !isElite && <Minus size={10} />}
                      
                      {isTop ? 'Top Yield' : isStruggling ? 'Review Required' : isElite ? 'Elite Yield' : 'Standard Yield'}
                    </div>
                  </td>

                </tr>
              );
            }) : (
              // ZERO-STATE FALLBACK
              <tr>
                <td colSpan={5} className="py-20">
                  <div className="flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] min-h-[250px] bg-slate-50/30 dark:bg-slate-800/10">
                     <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <Users className="w-8 h-8 text-primary animate-pulse" />
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-1">Awaiting Operator Telemetry</p>
                        <p className="text-xs text-slate-400 italic">Establishing secure node connection...</p>
                     </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}