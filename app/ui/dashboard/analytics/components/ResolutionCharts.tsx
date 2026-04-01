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
import { Timer, Clock } from 'lucide-react';

// --- 1. INTERFACES & CONFIG ---
interface ResolutionData {
  name: string; // e.g., '< 24h', '1-3 Days'
  count: number;
}

interface ResolutionChartProps {
  data?: ResolutionData[];
}

// HCI: Semantic Color Mapping based on SLA (Service Level Agreement) Risk
const SLA_COLORS: Record<string, string> = {
  '< 24h': '#10b981',   // Emerald (Healthy)
  '1-3 Days': '#3b82f6', // Blue (Standard)
  '3-7 Days': '#f59e0b', // Amber (Warning)
  '7+ Days': '#f43f5e',  // Rose (Critical SLA Breach)
};

// --- 2. CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const rawData = payload[0].payload;

    return (
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
          {rawData.name} Bucket
        </p>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: rawData.color }} />
          <p className="text-xl font-black text-white uppercase tracking-tighter">
            {payload[0].value} <span className="text-[10px] opacity-50">Tickets</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// --- 3. MAIN COMPONENT ---
export default function ResolutionChart({ data = [] }: ResolutionChartProps) {
  
  // Map the incoming data to our strict SLA color codes
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      ...item,
      color: SLA_COLORS[item.name] || '#64748b' // Fallback to Slate if unknown bucket
    }));
  }, [data]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group/chart transition-all hover:shadow-md">
      
      {/* --- HEADER --- */}
      <div className="flex items-start gap-4 mb-10">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <Timer className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Resolution Lifecycle</h3>
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Duration <span className="text-primary">Distribution</span>
          </p>
        </div>
      </div>

      {/* --- CHART CONTAINER --- */}
      <div className="flex-1 w-full min-h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid 
                strokeDasharray="4 4" 
                vertical={false} 
                stroke="currentColor" 
                className="text-slate-100 dark:text-slate-800/50" 
              />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} 
                content={<CustomTooltip />} 
              />
              <Bar 
                dataKey="count" 
                radius={[8, 8, 0, 0]} 
                barSize={40}
                animationDuration={1500}
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
          <div className="h-full w-full flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl min-h-[250px]">
             <Clock className="w-8 h-8 text-slate-300 animate-pulse" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Lifecycle Telemetry...</p>
          </div>
        )}
      </div>

      {/* --- FOOTER / LEGEND --- */}
      <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/60 flex justify-between items-center">
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest italic">
          * Automated Workspace Analysis
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 group cursor-help">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 group-hover:text-emerald-500 transition-colors uppercase tracking-tighter">Healthy SLA</span>
          </div>
          <div className="flex items-center gap-1.5 group cursor-help">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[9px] font-black text-slate-400 group-hover:text-rose-500 transition-colors uppercase tracking-tighter">SLA Risk</span>
          </div>
        </div>
      </div>

    </div>
  );
}