'use client';

import Link from 'next/link';
import { 
  Building2, 
  User, 
  Clock, 
  Activity, 
  ChevronLeft,
  SearchX
} from 'lucide-react';

// --- 1. DB-ALIGNED INTERFACE ---
// Mapped to public.leads + joined employee data
export interface LeadDetail {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  employee_name: string; // Joined from public.employees
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  potential_value: number;
  source: string;
  created_at: string;
  updated_at: string; 
}

export interface LeadsDetailPageProps {
  leads?: LeadDetail[];
}

export default function LeadsDetailPage({ leads = [] }: LeadsDetailPageProps) {
  
  // Logic: Calculate days from start to finish
  const getVelocity = (start: string, end: string, status: string) => {
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Only show "Cycle" time if the lead is fully resolved
    if (status === 'won' || status === 'lost') {
      return `${diffDays} Day Cycle`;
    }
    return `Active for ${diffDays} Days`;
  };

  return (
    <div className="p-4 lg:p-10 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Link href="/protected/analytics-and-reporting" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest mb-4 transition-colors">
            <ChevronLeft className="w-3 h-3" /> Return to Analytics Workspace
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Pipeline Telemetry
            </h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-11">
            Lead Resolution & Velocity Log
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {leads.length} Entries Logged
          </span>
        </div>
      </div>

      {/* --- DATA GRID --- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Lead & Origin</th>
                <th className="px-10 py-6">Agent Context</th>
                <th className="px-10 py-6">Lifecycle Velocity</th>
                <th className="px-10 py-6 text-center">Pipeline Status</th>
                <th className="px-10 py-6 text-right">Potential Yield (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {leads.length > 0 ? leads.map((lead) => {
                
                // Semantic Pipeline Coloring
                const isWon = lead.status === 'won';
                const isLost = lead.status === 'lost';
                const isQualified = lead.status === 'qualified';
                const isActive = lead.status === 'contacted';

                return (
                  <tr key={lead.id} className="group hover:bg-slate-50 dark:hover:bg-blue-900/5 transition-colors">
                    
                    {/* 1. LEAD & ORIGIN */}
                    <td className="px-10 py-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                            {lead.first_name} {lead.last_name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            <Building2 className="w-3 h-3" /> {lead.company_name || 'No Company'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. AGENT CONTEXT */}
                    <td className="px-10 py-6">
                      <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                        {lead.employee_name || 'Unassigned'}
                      </p>
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1">
                        Source: {lead.source || 'Direct'}
                      </p>
                    </td>

                    {/* 3. LIFECYCLE VELOCITY */}
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          In: {new Date(lead.created_at).toLocaleDateString('en-GB')}
                        </p>
                        <p className={`text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest ${isWon ? 'text-emerald-600 dark:text-emerald-400' : isLost ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                          <Clock className="w-3 h-3" />
                          {getVelocity(lead.created_at, lead.updated_at, lead.status)}
                        </p>
                      </div>
                    </td>

                    {/* 4. PIPELINE STATUS */}
                    <td className="px-10 py-6 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        isWon 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800/50' 
                          : isLost
                          ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-100 dark:border-rose-800/50'
                          : isQualified
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800/50'
                          : isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-800/50'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>

                    {/* 5. POTENTIAL YIELD */}
                    <td className="px-10 py-6 text-right">
                      <p className={`font-mono font-black text-base tracking-tighter ${isWon ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {Number(lead.potential_value).toLocaleString('en-KE')}
                      </p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        {isWon ? 'Settled Revenue' : 'Projected Value'}
                      </p>
                    </td>

                  </tr>
                );
              }) : (
                // ZERO-STATE FALLBACK
                <tr>
                  <td colSpan={5} className="px-10 py-20">
                    <div className="flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl min-h-[250px] bg-slate-50/50 dark:bg-slate-800/20">
                      <SearchX className="w-8 h-8 text-slate-300" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Pipeline Data Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* --- FOOTER LOGS --- */}
      <div className="py-8 text-center opacity-50">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mb-2">
          Workspace Telemetry End-of-File
        </p>
        <p className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter italic">
          Data synchronized via secure RPC layer
        </p>
      </div>

    </div>
  );
}