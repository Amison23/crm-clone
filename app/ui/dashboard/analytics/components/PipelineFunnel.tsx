'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PipelineFunnel({ funnelData }: { funnelData: any[] }) {
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