'use client';

import { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
} from 'recharts';
import { Zap, Calendar, TrendingUp } from 'lucide-react';

// Standardized mapping for the Intelligence Node telemetry
const viewConfig = {
  total: { color: '#3b82f6', label: 'Gross Volume', unit: 'Total Units' },
  closed: { color: '#10b981', label: 'Resolution Yield', unit: 'Resolved Units' },
  ongoing: { color: '#f59e0b', label: 'Active Pipeline', unit: 'Active Units' },
  failed: { color: '#f43f5e', label: 'System Drop-off', unit: 'Dropped Units' },
  revenue: { color: '#8b5cf6', label: 'Financial Yield', unit: 'KES' } // NEW: Financial Layer
};

type ViewType = keyof typeof viewConfig;

export default function PerformanceDeepDive({ data = [] }: { data: any[] }) {
  const [timeFrame, setTimeFrame] = useState<'1m' | '7d'>('1m');
  const [view, setView] = useState<ViewType>('total');

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return timeFrame === '7d' ? data.slice(-7) : data.slice(-30);
  }, [data, timeFrame]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isRevenue = view === 'revenue';

      return (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-[1.5rem] shadow-2xl space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">
            Audit Point: {label}
          </p>
          <div className="flex flex-col">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">
              {viewConfig[view].label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-white tracking-tighter">
                {isRevenue 
                  ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value)
                  : value
                }
              </p>
              {!isRevenue && <span className="text-[9px] font-black text-slate-500 uppercase">{viewConfig[view].unit}</span>}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8 relative z-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/10 text-primary rounded-[1.5rem] shadow-inner group-hover:rotate-12 transition-transform duration-500">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">
                Temporal Growth Velocity
              </h3>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              Operational <span className="text-primary italic">Throughput</span>
            </p>
          </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
          <div className="flex gap-1 pr-4 border-r border-slate-200 dark:border-slate-700">
            {['1m', '7d'].map((tf) => (
              <button 
                key={tf} 
                onClick={() => setTimeFrame(tf as any)} 
                className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${timeFrame === tf ? 'bg-white dark:bg-slate-900 text-primary shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tf}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(['total', 'ongoing', 'closed', 'revenue'] as ViewType[]).map((type) => (
              <button 
                key={type} 
                onClick={() => setView(type)} 
                className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${view === type ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- CHART --- */}
      <div className="h-[450px] w-full relative z-10">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={viewConfig[view].color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={viewConfig[view].color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis 
                dataKey="date" 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontWeight: 900, fontFamily: 'monospace' }} 
                dy={15} 
                interval={timeFrame === '1m' ? 5 : 0}
              />
              <YAxis 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontWeight: 900, fontFamily: 'monospace' }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: viewConfig[view].color, strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Area 
                type="monotone" 
                dataKey={view} 
                stroke={viewConfig[view].color} 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#colorView)" 
                animationDuration={1500} 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center space-y-6 border-4 border-dashed border-slate-50 dark:border-slate-800/50 rounded-[3rem]">
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full animate-bounce">
              <Calendar className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] italic">Awaiting Telemetry Stream...</p>
          </div>
        )}
      </div>

      {/* --- FOOTER LABEL --- */}
      <div className="mt-8 flex justify-center">
        <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.6em]">
          Temporal Horizon • Secure Audit Node af-south-1
        </p>
      </div>
    </div>
  );
}