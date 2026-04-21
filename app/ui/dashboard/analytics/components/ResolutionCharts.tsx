'use client';

import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Timer, Clock, Zap } from 'lucide-react';

// --- 1. CONFIGURATION ---
interface ResolutionData {
  name: string; 
  count: number;
}

const SLA_COLORS: Record<string, string> = {
  '< 24h': '#10b981',    // Emerald (Optimal)
  '1-3 Days': '#3b82f6',  // Blue (Nominal)
  '3-7 Days': '#f59e0b',  // Amber (Warning)
  '7+ Days': '#f43f5e',   // Rose (Breach)
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const rawData = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-[1.5rem] shadow-2xl backdrop-blur-md z-50">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">
          SLA Bucket: {rawData.name}
        </p>
        <div className="flex items-center gap-4">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: rawData.color }} />
          <p className="text-2xl font-black text-white tracking-tighter">
            {payload[0].value} <span className="text-[10px] text-slate-400 ml-1">Incidents</span>
          </p>
        </div>
        <p className="text-[9px] font-bold text-emerald-500/80 uppercase mt-2 italic tracking-widest">
          Verified Resolution State
        </p>
      </div>
    );
  }
  return null;
};

// --- 2. MAIN COMPONENT ---
export default function ResolutionChart({ data = [] }: { data?: ResolutionData[] }) {
  
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      ...item,
      color: SLA_COLORS[item.name] || '#64748b'
    }));
  }, [data]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group/chart transition-all duration-500 hover:border-primary/20 h-[500px]">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-primary/10 text-primary rounded-[1.2rem] shadow-inner group-hover/chart:rotate-12 transition-transform duration-500">
            <Timer className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">
                Resolution Lifecycle
              </h3>
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              Efficiency <span className="text-primary italic">Yield</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
           <Zap size={12} className="text-amber-500" fill="currentColor" />
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SLA Node Active</span>
        </div>
      </div>

      {/* CHART INTERFACE */}
      <div className="flex-1 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart 
              data={chartData} 
              margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="8 8" 
                vertical={false} 
                stroke="currentColor" 
                className="text-slate-100 dark:text-slate-800/50" 
              />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900, fontFamily: 'monospace' }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900, fontFamily: 'monospace' }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} 
                content={<CustomTooltip />} 
              />
              <Bar 
                dataKey="count" 
                radius={[12, 12, 0, 0]} 
                barSize={48}
                animationDuration={1500}
                animationEasing="ease-in-out"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    fillOpacity={0.8}
                    className="hover:fill-opacity-100 transition-all duration-300 cursor-crosshair"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center space-y-6 border-4 border-dashed border-slate-50 dark:border-slate-800/50 rounded-[2.5rem] min-h-[300px]">
             <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full animate-bounce">
               <Clock className="w-10 h-10 text-slate-300" />
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] italic">Awaiting Telemetry Stream...</p>
          </div>
        )}
      </div>

      {/* FOOTER LEGEND */}
      <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-6">
        <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] italic">
          * Unit: Time-to-Resolution (TTR)
        </p>
        <div className="flex gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full group cursor-help transition-all">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Healthy SLA</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full group cursor-help transition-all">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Risk Breach</span>
          </div>
        </div>
      </div>
    </div>
  );
}