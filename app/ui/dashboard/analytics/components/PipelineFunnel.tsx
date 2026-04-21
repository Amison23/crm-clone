'use client';

import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  LabelList 
} from 'recharts';
import { Filter, Target, Zap, TrendingUp } from 'lucide-react';

/**
 * 🎨 STAGE PROTOCOL: Standardized Color Mapping
 */
const STAGE_COLORS: Record<string, string> = {
  'NEW': '#94a3b8',       // Slate 400
  'CONTACTED': '#3b82f6', // Blue 500
  'QUALIFIED': '#f59e0b', // Amber 500
  'WON': '#10b981',       // Emerald 500
  'LOST': '#f43f5e',      // Rose 500
};

interface PipelineItem {
  stage: string;
  count: number;
  value: number; // Potential Yield
}

export default function PipelineFunnel({ funnelData = [] }: { funnelData: PipelineItem[] }) {
  
  /**
   * 🧠 TRANSFORMATION LAYER
   * Enriches raw database counts with conversion velocity and currency formatting.
   */
  const chartData = useMemo(() => {
    return funnelData.map((item, index) => {
      // Logic: Conversion math based on lead volume drop-off from the previous stage
      const prevCount = index > 0 ? funnelData[index - 1].count : item.count;
      const conversion = index === 0 ? 100 : Math.round((item.count / prevCount) * 100) || 0;
      
      return {
        ...item,
        stage: item.stage.toUpperCase(),
        color: STAGE_COLORS[item.stage.toUpperCase()] || '#3b82f6',
        velocity: `${conversion}% Velocity`,
        // Formatting the Yield for the UI (KES)
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
      
      {/* BACKGROUND TELEMETRY DECORATION */}
      <Target size={140} className="absolute -right-10 -top-10 opacity-5 dark:opacity-[0.03] rotate-12 pointer-events-none" />

      {/* --- HEADER --- */}
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-[1.2rem] shadow-inner">
            <Filter size={22} />
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

        <div className="hidden md:flex flex-col items-end">
           <div className="flex items-center gap-2 text-emerald-500">
              <Zap size={12} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Sync</span>
           </div>
           <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
             Cross-Node Telemetry: Verified
           </p>
        </div>
      </div>

      {/* --- CHART INTERFACE --- */}
      <div className="flex-1 w-full relative z-10">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={chartData} 
              margin={{ left: 10, right: 80, top: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="stage" 
                type="category" 
                width={110} 
                axisLine={false} 
                tickLine={false} 
                tick={{ 
                  fill: '#94a3b8', 
                  fontWeight: 900, 
                  fontSize: 10, 
                  letterSpacing: '0.1em' 
                }} 
              />
              
              <Tooltip 
                cursor={{ fill: 'rgba(59, 130, 246, 0.03)' }} 
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl space-y-4">
                      {/* Tooltip Header */}
                      <div className="flex justify-between items-center gap-10 border-b border-white/5 pb-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {data.stage}
                        </p>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full italic">
                          {data.velocity}
                        </span>
                      </div>

                      {/* Metric: Volume */}
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Node Volume
                        </p>
                        <p className="text-2xl font-black text-white tracking-tighter leading-none">
                          {data.count} <span className="text-[10px] text-slate-500 ml-1">Leads</span>
                        </p>
                      </div>

                      {/* Metric: Yield */}
                      <div className="pt-3 border-t border-white/5">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">
                          Stage Yield
                        </p>
                        <p className="text-2xl font-black text-emerald-400 tracking-tighter leading-none">
                          {data.displayYield}
                        </p>
                      </div>
                    </div>
                  );
                }} 
              />

              <Bar 
                dataKey="count" 
                radius={[0, 15, 15, 0]} 
                barSize={32}
                animationDuration={1500}
                animationEasing="ease-in-out"
              >
                {chartData.map((entry, i) => (
                  <Cell 
                    key={`cell-${i}`} 
                    fill={entry.color} 
                    fillOpacity={0.85} 
                    className="hover:fill-opacity-100 transition-all duration-300"
                  />
                ))}
                
                {/* IN-BAR LABELS */}
                <LabelList 
                  dataKey="count" 
                  position="right" 
                  offset={15}
                  style={{ 
                    fill: '#64748b', 
                    fontSize: 12, 
                    fontWeight: 900, 
                    fontFamily: 'monospace',
                    letterSpacing: '-0.05em'
                  }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* EMPTY STATE telemetery */
          <div className="h-full flex flex-col items-center justify-center space-y-6">
             <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-full animate-pulse text-slate-300">
               <TrendingUp size={40} />
             </div>
             <div className="text-center space-y-2">
               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
                 Initializing Pipeline
               </p>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">
                 Waiting for af-south-1 data packets...
               </p>
             </div>
          </div>
        )}
      </div>

      {/* --- FOOTER LEGEND --- */}
      <div className="mt-6 flex items-center justify-center gap-8 py-5 border-t border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10">
         {['WON', 'QUALIFIED', 'CONTACTED'].map((stage) => (
           <div key={stage} className="flex items-center gap-3 group cursor-help">
             <div 
               className="h-2.5 w-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform" 
               style={{ backgroundColor: STAGE_COLORS[stage] }} 
             />
             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
               {stage}
             </span>
           </div>
         ))}
      </div>

    </div>
  );
}