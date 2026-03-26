'use client';

import Link from 'next/link';

export interface LeadDetail {
  id: string;
  name: string;
  contact_person: string;
  status: 'Closed' | 'Active' | 'Pending' | 'Lost';
  potential_value: number;
  region: string;
  started_at: string;
  completed_at: string | null;
}

export interface LeadsDetailPageProps {
  leads: LeadDetail[];
}

export default function LeadsDetailPage({ leads = [] }: LeadsDetailPageProps) {
  // Logic: Calculate days from start to finish
  const getVelocity = (start: string, end: string | null) => {
    if (!end) return null;
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Day Cycle`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* ... Navigation & Header (same as your code) ... */}

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
            <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-8 py-5">Lead & Agent</th>
              <th className="px-8 py-5">Lifecycle Metrics</th>
              <th className="px-8 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-right">Settled Value (KES)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {leads.map((lead) => (
              <tr key={lead.id} className="group hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                
                <td className="px-8 py-6">
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {lead.name}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase font-mono">
                    ID: {lead.id} • Rep: {lead.contact_person}
                  </p>
                </td>

                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[11px] font-bold text-gray-600 dark:text-slate-300 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Acquired: {new Date(lead.started_at).toLocaleDateString()}
                    </p>
                    {lead.completed_at && (
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Converted: {getVelocity(lead.started_at, lead.completed_at)}
                      </p>
                    )}
                  </div>
                </td>

                {/* ... Status & Revenue (same as your code) ... */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ... Footer (same as your code) ... */}
    </div>
  );
}