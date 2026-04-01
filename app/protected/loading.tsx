


export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-20 animate-pulse">
      
      {/* --- 1. HEADER SKELETON --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 dark:border-slate-800 pb-8">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-10 w-64 bg-slate-300 dark:bg-slate-700 rounded-2xl" />
          <div className="h-4 w-80 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="h-12 w-40 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </header>

      {/* --- 2. SUMMARY CARDS SKELETON --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]" />
        ))}
      </div>

      {/* --- 3. VELOCITY & PRECISION GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-28 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-[2.5rem]" />
        <div className="h-28 bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/30 rounded-[2.5rem]" />
      </div>

      {/* --- 4. MAIN ANALYTICS SECTION --- */}
      <section className="space-y-6">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-full ml-2" />
        <div className="h-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem]" />
      </section>

      {/* --- 5. TABLE / LIST SKELETON --- */}
      <section className="space-y-6">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-full ml-2" />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
          <div className="h-16 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800" />
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800/30 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}