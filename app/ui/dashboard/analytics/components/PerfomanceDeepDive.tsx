// app/ui/dashboard/analytics/components/PerformanceDeepDive.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

export default function PerformanceDeepDive({ data = [] }: { data: any[] }) {
  const router = useRouter();
  const [view, setView] = useState<'total' | 'closed' | 'failed'>('total');
  const [timeFrame, setTimeFrame] = useState('1m');

  const filteredData = useMemo(() => {
    if (timeFrame === '7d') return data.slice(-7);
    return data.slice(-30);
  }, [data, timeFrame]);

  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Volume Intelligence</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Lead Volume Analysis</p>
          </div>
          <div className="flex gap-2">
            {['total', 'closed', 'failed'].map((type) => (
              <button
                key={type}
                onClick={() => setView(type as any)}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  view === type ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={filteredData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800 }} dy={10} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800 }} />
              <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
              <Bar dataKey={view} radius={[10, 10, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}