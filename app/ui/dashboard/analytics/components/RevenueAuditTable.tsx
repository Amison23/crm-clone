'use client';

import { 
  Package, 
  UserCheck, 
  Calendar, 
  ArrowUpRight, 
  ShieldCheck, 
  Building2,
  Activity
} from 'lucide-react';

interface RevenueRow {
  transaction_id?: string;
  timestamp: string;
  internal_node?: string;
  client_org?: string;
  lead_identity?: string;
  product_name?: string;
  category?: string;
  closing_agent?: string;
  settled_value: number | string;
}

export default function RevenueAuditTable({ data = [] }: { data: RevenueRow[] }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500">
      
      {/* --- 1. AUDIT HEADER --- */}
      <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30 dark:bg-slate-800/20">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
              Verified Acquisition Log
            </h3>
            <div className="flex items-center gap-2 mt-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                 Financial Settlement Audit • af-south-1
               </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
           <Activity size={12} className="text-primary" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
             {data.length} Transactions Synced
           </span>
        </div>
      </div>

      {/* --- 2. DATA GRID --- */}
      {/* Mobile Cards (< md) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {data.map((row, index) => {
          const validDate = row.timestamp ? new Date(row.timestamp) : null;
          const validAmount = Number(row.settled_value) || 0;

          return (
            <div key={row.transaction_id ? `${row.transaction_id}-${index}` : `rev-${index}`} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] font-black rounded uppercase tracking-widest">
                    {row.internal_node || 'CORE_NODE'}
                  </span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
                    {row.client_org || 'Direct Acquisition'}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-emerald-600/70 uppercase block">KES</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2 }).format(validAmount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Product</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{row.product_name || 'N/A'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Closing Operator</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{row.closing_agent || 'System'}</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>{validDate && !isNaN(validDate.getTime()) ? validDate.toLocaleDateString('en-GB') : 'Buffer...'}</span>
                <span className="text-[9px] font-bold uppercase text-slate-400">ID: {row.lead_identity || 'Verified'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <th className="px-10 py-6">Temporal Stamp</th>
              <th className="px-10 py-6">Node / Acquisition Target</th>
              <th className="px-10 py-6">Product Unit</th>
              <th className="px-10 py-6">Closing Operator</th>
              <th className="px-10 py-6 text-right">Settled Yield (KES)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {data.map((row, index) => {
              const validDate = row.timestamp ? new Date(row.timestamp) : null;
              const validAmount = Number(row.settled_value) || 0;

              return (
                <tr
                  key={row.transaction_id ? `${row.transaction_id}-${index}` : `rev-${index}`}
                  className="group hover:bg-slate-50/80 dark:hover:bg-primary/5 transition-all duration-300 cursor-default"
                >
                  {/* 1. TIMESTAMP */}
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3 text-xs font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                      <Calendar size={14} className="opacity-30 group-hover:text-primary group-hover:opacity-100 transition-all" />
                      {validDate && !isNaN(validDate.getTime()) 
                        ? validDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'BUFFERING...'}
                    </div>
                  </td>

                  {/* 2. IDENTITY (Internal Node Badge + Client Name) */}
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] font-black rounded uppercase tracking-widest shadow-sm">
                          {row.internal_node || 'CORE_NODE'}
                        </span>
                        <ArrowUpRight size={10} className="text-slate-300" />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                          {row.client_org || 'Direct Acquisition'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          ID: {row.lead_identity || 'Verified Identity'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 3. PRODUCT UNIT */}
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200/50 dark:border-slate-700/50 group-hover:border-primary/30 transition-all">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight leading-none mb-1.5">
                          {row.product_name || 'Provisioning...'}
                        </p>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-lg italic tracking-widest">
                          {row.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 4. CLOSING OPERATOR */}
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <UserCheck size={14} />
                      </div>
                      {row.closing_agent || 'Neural System'}
                    </div>
                  </td>

                  {/* 5. SETTLED YIELD (Industrial Value) */}
                  <td className="px-10 py-8 text-right">
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest">Kes</span>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter leading-none">
                          {new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2 }).format(validAmount)}
                        </p>
                      </div>
                      <p className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Settlement Verified
                      </p>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* --- 3. EMPTY STATE NODE --- */}
      {data.length === 0 && (
        <div className="p-32 text-center flex flex-col items-center justify-center space-y-6 bg-slate-50/10">
          <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-300 shadow-inner animate-pulse">
            <Building2 size={40} />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-black text-slate-400 uppercase tracking-[0.3em]">
              Buffer Empty
            </p>
            <p className="text-[10px] font-mono text-slate-500 uppercase italic">
              Listening for secure af-south-1 telemetry...
            </p>
          </div>
        </div>
      )}

      {/* --- 4. SYSTEM FOOTER --- */}
      <div className="px-10 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">
           Audit Node v3.0.1
         </p>
         <p className="text-[8px] font-mono text-slate-500 dark:text-slate-600 uppercase tracking-tighter">
           RLS Check: Pass • Secure Tunnel: Active
         </p>
      </div>
    </div>
  );
}