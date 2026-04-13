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
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Sales Pipeline Funnel</h3>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart layout="vertical" data={funnelData}>
          <XAxis type="number" hide />
          <YAxis dataKey="stage" type="category" width={100} axisLine={false} tickLine={false} />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}