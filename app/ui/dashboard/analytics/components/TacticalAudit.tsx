'use client';

import { ShieldAlert, Zap, Clock, UserPlus, ArrowRight, CheckCircle } from 'lucide-react';

export default function TacticalAudit({ frictionData = [], unassignedData = [] }: { frictionData: any[], unassignedData: any[] }) {
  return (
    <div className="space-y-10">
      
      {/* --- SECTION 1: CRITICAL FRICTION & DENSITY --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-rose-50/30 dark:bg-rose-950/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-lg animate-pulse">
              <ShieldAlert size={18} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Friction & Density Audit</h3>
          </div>
          {frictionData.length > 0 && (
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-100 dark:bg-rose-900/40 px-4 py-1.5 rounded-full">
              Action Required: {frictionData.length} Points
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          {frictionData.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="px-8 py-5">Objective</th>
                  <th className="px-8 py-5">Assigned Agent</th>
                  <th className="px-8 py-5 text-center">Priority</th>
                  <th className="px-8 py-5">Deadline Status</th>
                  <th className="px-8 py-5 text-right">Metric Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {frictionData.map((task) => (
                  <tr key={task.task_id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-6 font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">{task.title}</td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase">{task.assigned_to || 'UNASSIGNED'}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
                        task.priority === 'high' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
                        <Clock size={12} /> {new Date(task.due_date).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${task.metric_type === 'FRICTION' ? 'text-rose-500' : 'text-blue-500'}`}>
                        {task.metric_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
               <CheckCircle size={40} className="mb-4 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Flow: Optimal</p>
            </div>
          )}
        </div>
      </div>

      {/* --- SECTION 2: UNASSIGNED ROUTING --- */}
      <div className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden p-1">
        <div className="p-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-slate-900 rounded-lg"><Zap size={18} fill="currentColor" /></div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Unassigned Pipeline Queue</h3>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em]">Yield at Risk Detection</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Risk: {unassignedData.length} Units</span>
        </div>

        <div className="bg-slate-900 overflow-x-auto">
          {unassignedData.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-800">
                {unassignedData.map((lead) => (
                  <tr key={lead.lead_id} className="group hover:bg-slate-800/50 transition-all">
                    <td className="px-8 py-8">
                      <p className="text-lg font-black text-white uppercase tracking-tighter">{lead.lead_name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{lead.company_name} • {lead.source}</p>
                    </td>
                    <td className="px-8 py-8">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Potential Yield</p>
                       <p className="text-2xl font-black text-amber-500 tracking-tighter">KES {new Intl.NumberFormat('en-KE').format(lead.yield_at_risk)}</p>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-auto hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95">
                        <UserPlus size={14} /> Assign Operator <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-800">
               <Zap size={40} className="mb-4 opacity-10" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Unassigned Yield Detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}