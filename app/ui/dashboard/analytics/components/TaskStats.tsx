'use client';

interface Trend {
  value: number;
  isPositive: boolean;
}

interface TaskStatsProps {
  total: number;
  completed: number;
  overdue: number;
  avgResolution: number;
  trends: {
    completion: Trend;
    overdue: Trend;
    resolution: Trend;
  }
}

export default function TaskStats({ total, completed, overdue, avgResolution, trends }: TaskStatsProps) {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const openItems = total - completed;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      
      {/* 1. COMPLETION RATE */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-3">
          <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Completion Rate</p>
          <TrendBadge trend={trends.completion} />
        </div>
        <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{completionRate}%</p>
            <span className="text-[10px] font-bold text-blue-500 uppercase">Precision</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000" 
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* 2. OVERDUE TASKS */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-sm transition-all hover:shadow-md group">
        <div className="flex justify-between items-start mb-3">
          <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Overdue Tasks</p>
          <TrendBadge trend={trends.overdue} invertColors /> 
        </div>
        <div className="flex items-center gap-3">
            <p className="text-3xl font-black text-red-600 dark:text-red-500 tracking-tighter">{overdue}</p>
            {overdue > 0 && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />}
        </div>
        <p className="text-[10px] font-bold text-red-400 dark:text-red-900/60 uppercase mt-2 italic">Requires action</p>
      </div>

      {/* 3. AVG. RESOLUTION */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-3">
          <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Avg. Resolution</p>
          <TrendBadge trend={trends.resolution} invertColors />
        </div>
        <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{avgResolution}</p>
            <span className="text-sm font-bold text-gray-400 dark:text-slate-600">HRS</span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase mt-2">Lifecycle Velocity</p>
      </div>

      {/* 4. OPEN PIPELINE */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Active Pipeline</p>
        <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{openItems}</p>
            <span className="text-[10px] font-bold text-blue-400/50 uppercase">Tickets</span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase mt-2 tracking-tight">Current resolution</p>
      </div>

    </div>
  );
}

/**
 * Reusable Trend Badge
 * Handles positive/negative colors and inversions (e.g., rising overdue is "bad")
 */
function TrendBadge({ trend, invertColors = false }: { trend: Trend, invertColors?: boolean }) {
  const isGood = invertColors ? !trend.isPositive : trend.isPositive;
  
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black border ${
      isGood 
        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' 
        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/50'
    }`}>
      <span>{trend.isPositive ? '↑' : '↓'}</span>
      <span>{trend.value}%</span>
    </div>
  );
}