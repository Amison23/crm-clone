'use client';

export function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* 1. DATA CARD SKELETON (Revenue / Leads) */}
      {[1, 2].map((i) => (
        <div 
          key={i}
          className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col justify-between"
        >
          <div>
            {/* Label Shimmer */}
            <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse mb-4" />
            
            <div className="flex items-baseline gap-3">
              {/* Unit Shimmer */}
              <div className="h-4 w-6 bg-slate-50 dark:bg-slate-800/50 rounded animate-pulse" />
              {/* Massive Number Shimmer */}
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Badge/Yield Shimmer */}
          <div className="mt-8 flex items-center gap-2">
            <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
          </div>
        </div>
      ))}

      {/* 2. SYSTEM CARD SKELETON (The Blue "Active" Node) */}
      <div className="p-8 bg-blue-600/10 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800/50 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background pulse to indicate "System" activity */}
        <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
        
        <div className="relative z-10">
          <div className="h-2.5 w-20 bg-blue-200 dark:bg-blue-800/50 rounded-full animate-pulse mb-4" />
          <div className="h-10 w-36 bg-blue-300 dark:bg-blue-700/50 rounded-xl animate-pulse" />
        </div>

        <div className="relative z-10 mt-8 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-300 dark:bg-blue-800 animate-ping" />
          <div className="h-2 w-24 bg-blue-200 dark:bg-blue-800/50 rounded-full animate-pulse" />
        </div>
      </div>

    </div>
  );
}