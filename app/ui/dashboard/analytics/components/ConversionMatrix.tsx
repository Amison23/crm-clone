'use client';

import { useMemo, useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Sector // <-- We need this for the custom active shape
} from 'recharts';
import { 
  Target, 
  PieChart as PieChartIcon, 
  Inbox,
  ArrowRight
} from 'lucide-react';

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

// HCI: Themed Tooltip (Kept simple)
const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      // Added 'relative z-50' to force this layer above the center text
      <div className="relative z-50 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
          {data.name} Volume
        </p>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="text-xl font-black text-white tracking-tighter uppercase">
            {payload[0].value} <span className="text-[10px] opacity-0">Leads</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};
// --- CUSTOM ACTIVE SHAPE (The "Hover-Out" Magic) ---
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  // Logic: Create an "expanded" and "offset" ring for the hovered slice
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius + 5} // Shift the inner edge out by 5px
      outerRadius={outerRadius + 12} // Expand the outer edge by 12px
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill} // Maintain the original slice color
      stroke="none"
      className="transition-all duration-300 ease-out cursor-crosshair" // Smooth animation
    />
  );
};

export default function ConversionMetrics({ data }: { data: LeadConversionData }) {
  // New state to track the active slice index
const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  // Safe Data Calculation & Semantic Coloring
  const chartData = useMemo(() => {
    if (!data || data.total_leads === 0) return [];
    return [
      { name: 'Wins', value: data.wins, color: '#10b981' },       // Emerald
      { name: 'Pending', value: Math.max(0, data.total_leads - (data.wins + data.losses)), color: '#3b82f6' }, // Blue
      { name: 'Losses', value: data.losses, color: '#f43f5e' },    // Rose
    ];
  }, [data]);

  const hasData = data && data.total_leads > 0;
  
  // Safe bounded percentage for the progress bar (prevents >100% UI breaking)
  const safePercentage = Math.min(100, Math.max(0, data?.conversion_rate_percentage || 0));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* --- 1. CONVERSION RATE CARD --- */}
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md hover:border-blue-500/30 relative overflow-hidden">
        {/* Subtle background glow on hover */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 transition-transform group-hover:scale-110">
              <Target size={24} />
            </div>
            <div className="px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Yield</span>
            </div>
          </div>

          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">
            Conversion Rate
          </p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              {safePercentage}%
            </h3>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-tighter">Precision</span>
          </div>

          {/* Visual Progress Anchor */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-8 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${safePercentage}%` }}
            />
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 relative z-10">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase italic tracking-[0.2em]">
      * Evaluated Pipeline Depth
    </p>
    
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
      <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
        {data?.total_leads || 0} Total Leads
      </span>
    </div>
  </div>
</div>
      </div>
      
      {/* --- 2. CONVERSION PIE CHART --- */}
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-all hover:shadow-md relative overflow-hidden">
        
        <div className="flex items-start gap-4 mb-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <PieChartIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] leading-none mb-1.5">
              Leads Throughput
            </h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              Breakdown
            </p>
          </div>
        </div>

        <div className="flex-1 w-full relative min-h-[220px]">
          {hasData ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
             <PieChart>
                  <Pie 
                    data={chartData} 
                    innerRadius={70} 
                    outerRadius={105} 
                    paddingAngle={6} 
                    dataKey="value"
                    stroke="none"
                    animationDuration={800} // Faster, snappier feel
                    
                    // --- APPLYING THE "HOVER-OUT" EFFECT (TS Bypass) ---
                    {...({
                      activeIndex: activeIndex,
                      activeShape: renderActiveShape,
                    } as any)}
                    
                    // Event handlers to update the state (using undefined instead of null)
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        // Removed the general hover:opacity-80 class.
                        // The activeShape now handles all hover feedback.
                        className="transition-opacity focus:outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'transparent' }}
                    wrapperStyle={{ zIndex: 1000 }} // <-- Add this to force Recharts to elevate the container
                  />
                </PieChart>
              </ResponsiveContainer>

            {/* Floating Center Stat */}
{/* Added z-0 here to ensure it stays below the z-50 tooltip wrapper */}
<div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-2 z-0">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
    <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
      {data.total_leads}
    </p>
</div>
            </>
          ) : (
            // ZERO-STATE FALLBACK
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 mt-4">
              <Inbox className="w-8 h-8 text-slate-300 animate-bounce" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Leads</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}