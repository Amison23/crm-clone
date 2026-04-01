'use client';

import { BarChart3, Globe, Share2, PhoneCall, Mail } from 'lucide-react';

export default function SourceAnalytics({ data = [] }: { data: any[] }) {
  const getIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('linkedin') || s.includes('social')) return <Share2 size={16} />;
    if (s.includes('cold') || s.includes('phone')) return <PhoneCall size={16} />;
    if (s.includes('mail')) return <Mail size={16} />;
    return <Globe size={16} />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
          <BarChart3 size={20} />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Lead Source Telemetry</h3>
      </div>

      <div className="space-y-6">
        {data.map((item, i) => {
          // Calculate percentage for the bar (mock logic or prop-based)
          const percentage = Math.min(100, (item.lead_count / 10) * 100); 
          
          return (
            <div key={i} className="space-y-2 group">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="text-slate-400 group-hover:text-primary transition-colors">
                    {getIcon(item.source)}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    {item.source || 'Unknown Origin'}
                  </p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {item.lead_count} Leads • <span className="text-emerald-500 font-black">KES {Number(item.aggregate_value).toLocaleString()}</span>
                </p>
              </div>
              <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}