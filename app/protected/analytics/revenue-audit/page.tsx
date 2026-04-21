'use client';

import { 
  Package, 
  ArrowUpRight, 
  Terminal, 
  Clock, 
  Cpu, 
  User 
} from 'lucide-react';

interface RevenueAuditRow {
  transaction_id: string;
  internal_node: string;
  client_org: string | null;
  product_name: string;
  product_category: string;
  closing_agent: string;
  settled_value: number;
  timestamp: string;
  lead_source: string;
}

export default function RevenueAuditTable({ data = [] }: { data: RevenueAuditRow[] }) {
  const currencyFormatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Expansive Ledger Audit</h3>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-full uppercase tracking-widest">
          Node Verified
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              <th className="px-8 py-5">Product Node</th>
              <th className="px-8 py-5">Client Entity</th>
              <th className="px-8 py-5">Closing Authority</th>
              <th className="px-8 py-5 text-right">Settled Yield</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {data.length > 0 ? data.map((row) => (
              <tr key={row.transaction_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                
                {/* 1. PRODUCT NODE (internal_node) */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Cpu size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        {row.internal_node}
                      </p>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                        <Clock size={10} />
                        {new Date(row.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. CLIENT ENTITY (client_org) */}
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <p className="font-black text-sm text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                      {row.client_org || "Direct Acquisition"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {row.lead_source}
                      </span>
                      <ArrowUpRight size={10} className="text-slate-300" />
                    </div>
                  </div>
                </td>

                {/* 3. CLOSING AGENT */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <User size={12} />
                    </div>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                      {row.closing_agent}
                    </span>
                  </div>
                </td>

                {/* 4. SETTLED VALUE */}
                <td className="px-8 py-6 text-right">
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                    {currencyFormatter.format(row.settled_value)}
                  </p>
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">
                    Verified KES
                  </p>
                </td>

              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">
                    No Traces Found in Node Cluster
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}