'use client';

import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell, LabelList 
} from 'recharts';
import { Filter, Target, Zap, TrendingUp } from 'lucide-react';

const STAGE_COLORS: Record<string, string> = {
  'NEW': '#94a3b8',
  'CONTACTED': '#3b82f6',
  'QUALIFIED': '#f59e0b',
  'WON': '#10b981',
  'LOST': '#f43f5e',
};

export default function PipelineFunnel({ funnelData = [] }: { funnelData: any[] }) {
  
  const chartData = useMemo(() => {
    return funnelData.map((item, index) => {
      // 🎯 Conversion math based on lead volume drop-off
      const prevCount = index > 0 ? funnelData[index - 1].count : item.count;
      const conversion = index === 0 ? 100 : Math.round((item.count / prevCount) * 100) || 0;
      
      return {
        ...item,
        stage: item.stage.toUpperCase(),
        color: STAGE_COLORS[item.stage.toUpperCase()] || '#3b82f6',
        conversion: `${conversion}% Velocity`,
        // 🎯 Formatting the Yield for the UI
        displayYield: new Intl.NumberFormat('en-KE', { 
          style: 'currency', 
          currency: 'KES',
          minimumFractionDigits: 0
        }).format(item.value || 0)
      };
    });
  }, [funnelData]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm h-[500px] flex flex-col relative overflow-hidden group">
      
      <Target size={120} className="absolute -right-10 -top-10 opacity-5 dark:opacity-[0.03] rotate-12 pointer-events-none" />

      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-inner">
            <Filter size={20} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none mb-1.5 italic">
              Node Yield Audit
            </h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              Sales <span className="text-primary italic">Pipeline</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative z-10">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={chartData} margin={{ left: 20, right: 80 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="stage" 
                type="category" 
                width={100} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10, letterSpacing: '0.1em' }} 
              />
              
              <Tooltip 
                cursor={{ fill: 'rgba(59, 130, 246, 0.03)' }} 
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-[1.5rem] shadow-2xl space-y-3">
                      <div className="flex justify-between items-center gap-8 border-b border-white/5 pb-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{data.stage}</p>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full">{data.conversion}</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume</p>
                        <p className="text-xl font-black text-white tracking-tighter">{data.count} Leads</p>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Stage Yield</p>
                        <p className="text-xl font-black text-emerald-400 tracking-tighter">{data.displayYield}</p>
                      </div>
                    </div>
                  );
                }} 
              />

              <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={32}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.9} />
                ))}
                <LabelList 
                  dataKey="count" 
                  position="right" 
                  style={{ fill: '#64748b', fontSize: 11, fontWeight: 900, fontFamily: 'monospace' }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
             <TrendingUp className="w-12 h-12 text-slate-200 animate-pulse" />
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Initializing Pipeline Sync...</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 py-4 border-t border-slate-50 dark:border-slate-800">
         {['WON', 'QUALIFIED', 'CONTACTED'].map((stage) => (
           <div key={stage} className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage] }} />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stage}</span>
           </div>
         ))}
      </div>
    </div>
  );
}