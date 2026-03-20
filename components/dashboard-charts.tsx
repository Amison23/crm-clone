"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { name: "Mon", calls: 4000, chats: 2400, tickets: 2400 },
  { name: "Tue", calls: 3000, chats: 1398, tickets: 2210 },
  { name: "Wed", calls: 2000, chats: 9800, tickets: 2290 },
  { name: "Thu", calls: 2780, chats: 3908, tickets: 2000 },
  { name: "Fri", calls: 1890, chats: 4800, tickets: 2181 },
  { name: "Sat", calls: 2390, chats: 3800, tickets: 2500 },
  { name: "Sun", calls: 3490, chats: 4300, tickets: 2100 },
];

export function DashboardCharts() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97415" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f97415" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#64748b' }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#64748b' }} 
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
        />
        <Area type="monotone" dataKey="chats" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorChats)" />
        <Area type="monotone" dataKey="calls" stroke="#f97415" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
