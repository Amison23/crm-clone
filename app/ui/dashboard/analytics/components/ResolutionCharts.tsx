'use client';

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

// --- 1. DATA DEFINITION ---
const data = [
  { name: '< 24h', count: 42, color: '#10b981' }, // Emerald
  { name: '1-3 Days', count: 28, color: '#3b82f6' }, // Blue
  { name: '3-7 Days', count: 12, color: '#f59e0b' }, // Amber
  { name: '7+ Days', count: 4, color: '#ef4444' },  // Red
];

// --- 2. SAFE TYPESCRIPT INTERFACE ---
// We define our own interface to bypass Recharts' generic TooltipProps issues.
interface KpiTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
      count: number;
      color: string;
    };
  }>;
}

/**
 * Custom Tooltip Component
 * Optimized for Dark/Light mode and mobile-ready spacing.
 */
const CustomTooltip = ({ active, payload }: KpiTooltipProps) => {
  if (active && payload && payload.length) {
    const rawData = payload[0].payload;

    return (
      <div className="bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">
          {rawData.name} Bucket
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {payload[0].value}
          </p>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Tickets</span>
        </div>
      </div>
    );
  }
  return null;
};

// --- 3. MAIN COMPONENT ---
export default function ResolutionChart() {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm h-[400px] flex flex-col group/chart">
      
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              Resolution Lifecycle
          </h3>
        </div>
        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
            Duration Distribution
        </p>
      </div>

      {/* CHART CONTAINER */}
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid 
                strokeDasharray="4 4" 
                vertical={false} 
                stroke="#e2e8f0" 
                className="dark:stroke-slate-800/50" 
            />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
            />
            <Tooltip 
                cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} 
                content={<CustomTooltip />} 
            />
            <Bar 
                dataKey="count" 
                radius={[12, 12, 0, 0]} 
                barSize={44}
            >
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    fillOpacity={0.7}
                    className="hover:fill-opacity-100 transition-all duration-500 cursor-crosshair"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER / LEGEND */}
      <div className="mt-6 pt-6 border-t border-gray-50 dark:border-slate-800/60 flex justify-between items-center">
        <p className="text-[9px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest italic">
            * Automated Node Analysis
        </p>
        <div className="flex gap-4">
            <div className="flex items-center gap-1.5 group cursor-help">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                <span className="text-[9px] font-black text-gray-400 group-hover:text-emerald-500 transition-colors uppercase tracking-tighter">Healthy</span>
            </div>
            <div className="flex items-center gap-1.5 group cursor-help">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 group-hover:scale-125 transition-transform" />
                <span className="text-[9px] font-black text-gray-400 group-hover:text-red-500 transition-colors uppercase tracking-tighter">SLA Risk</span>
            </div>
        </div>
      </div>
    </div>
  );
}