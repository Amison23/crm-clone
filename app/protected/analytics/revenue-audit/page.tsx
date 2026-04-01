'use client';

import { useIntelligence } from '@/hooks/useIntelligence';
import { Package, ShieldCheck, UserCheck, ArrowUpRight, Building2 } from 'lucide-react';

export default function RevenueAuditPage() {
  const { intelligence } = useIntelligence();
  const data = intelligence?.revenueAudit || [];
  console.log('Revenue Audit Data:', data); // Debugging log to verify data structure

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <header className="space-y-2">
        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Section 5.1: Financial Settlement</h2>
        <h1 className="text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">
          Expansive <span className="text-emerald-500">Revenue Audit</span>
        </h1>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-10 py-6">Internal Workspace</th>
                <th className="px-10 py-6">Acquisition Target</th>
                <th className="px-10 py-6">Product & Category</th>
                <th className="px-10 py-6">Closer</th>
                <th className="px-10 py-6 text-right">Settled Yield (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {data.map((row: any) => (
                <tr key={row.transaction_id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                      {row.internal_node}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{row.client_org}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Source: {row.lead_source}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg"><Package size={16}/></div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{row.product_name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase">{row.product_category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    {row.closing_agent}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <p className="text-lg font-black text-emerald-600 tracking-tighter">
                      {new Intl.NumberFormat('en-KE').format(row.settled_value)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}