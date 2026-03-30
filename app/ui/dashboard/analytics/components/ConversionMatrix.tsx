'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
// Assuming LeadConversionData is defined in your types
import { LeadConversionData } from '@/app/types/analytics';

// --- SAFE TYPESCRIPT INTERFACE ---
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      color: string;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">
          {data.name}
        </p>
        <p className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
          {payload[0].value} <span className="text-[10px] font-bold text-gray-400">Leads</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ConversionMetrics({ data }: { data: LeadConversionData }) {
  const chartData = [
    { name: 'Wins', value: data.wins, color: '#10b981' }, 
    { name: 'Losses', value: data.losses, color: '#ef4444' }, 
    { name: 'Pending', value: Math.max(0, data.total_leads - (data.wins + data.losses)), color: '#3b82f6' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. CONVERSION RATE CARD */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md">
        <div>
          <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
            Conversion Rate
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">
              {data.conversion_rate_percentage}%
            </h3>
            <span className="text-[10px] font-bold text-blue-500/50 uppercase">Precision</span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase mt-4 italic">
            * Yield from {data.total_leads} global leads
        </p>
      </div>
      
      {/* 2. REVENUE CARD */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md">
        <div>
          <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
            Total Revenue
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-emerald-600/60 dark:text-emerald-400/60">KES</span>
            <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
              {new Intl.NumberFormat().format(data.total_revenue)}
            </h3>
          </div>
        </div>
        <p className="text-[10px] font-bold text-emerald-500/40 uppercase mt-4 tracking-widest">
            Settled Net Volume
        </p>
      </div>

      {/* 3. CONVERSION PIE CHART */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center transition-all hover:shadow-md relative overflow-hidden">
        <div className="w-full text-left mb-4">
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
                Pipeline Health
            </p>
            <p className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">Breakdown</p>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie 
                data={chartData} 
                innerRadius={50} 
                outerRadius={70} 
                paddingAngle={8} 
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'transparent' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Floating Center Stat */}
        <div className="absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Total</p>
            <p className="text-sm font-black text-gray-900 dark:text-white">{data.total_leads}</p>
        </div>
      </div>
    </div>
  );
}