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
import { Zap, Calendar } from 'lucide-react';

export default function PerformanceDeepDive({ data = [] }: { data: any[] }) {
  const [view, setView] = useState<'total' | 'closed' | 'failed'>('total');
  const [timeFrame, setTimeFrame] = useState<'1m' | '7d'>('1m');

  const viewConfig = {
    total: { color: '#3b82f6', label: 'Gross Volume' },
    closed: { color: '#10b981', label: 'Resolution Yield' },
    failed: { color: '#f43f5e', label: 'System Drop-off' }
  };

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return timeFrame === '7d' ? data.slice(-7) : data.slice(-30);
  }, [data, timeFrame]);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl">
        {/* 🎯 Updated Label for better UX */}
        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-2">
          Point-In-Time Audit: {label}
        </p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: viewConfig[view].color }} />
          <p className="text-lg font-black text-white uppercase tracking-tighter">
            {payload[0].value} <span className="text-[9px] opacity-40 uppercase">Resolved Units</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};
  return (
    <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1"> {/* Added space-y-1 to prevent vertical overlap */}
            <div className="flex items-center gap-2">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Temporal Growth Velocity</h3>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              Company <span className="text-primary">Throughput</span>
            </p>
          </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
           <div className="flex gap-1 pr-3 border-r border-slate-200 dark:border-slate-700">
              {['1m', '7d'].map((tf) => (
                <button key={tf} onClick={() => setTimeFrame(tf as any)} className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${timeFrame === tf ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-400'}`}>{tf}</button>
              ))}
           </div>
           <div className="flex gap-1">
              {['total', 'closed', 'failed'].map((type) => (
                <button key={type} onClick={() => setView(type as any)} className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${view === type ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-400'}`}>{type}</button>
              ))}
           </div>
        </div>
      </div>

      {/* --- CHART --- */}
      <div className="h-[400px] w-full">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={viewConfig[view].color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={viewConfig[view].color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#e2e8f0" />
<XAxis 
    dataKey="date" 
    fontSize={10} 
    axisLine={false} 
    tickLine={false} 
    tick={{ fill: '#94a3b8', fontWeight: 900 }} 
    dy={15} 
    interval={timeFrame === '1m' ? 4 : 0}
    /* 🎯 ADD THIS LABEL COMPONENT */
    label={{ 
      value: 'Temporal Horizon (Daily Snapshots)', 
      position: 'insideBottom', 
      offset: -10, 
      style: { 
        fontSize: '9px', 
        fontWeight: 900, 
        textTransform: 'uppercase', 
        letterSpacing: '0.2em', 
        fill: '#cbd5e1' 
      } 
    }}
  />              <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 900 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={view} stroke={viewConfig[view].color} strokeWidth={4} fillOpacity={1} fill="url(#colorView)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
             <Calendar className="w-8 h-8 text-slate-300 animate-bounce" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Workspace Data Stream...</p>
          </div>
        )}
      </div>
    </div>
  );
}