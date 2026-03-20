export default function AnalyticsAndReporting() {
  return (
    <>
      
<div className="flex min-h-screen">

<div className="w-full flex-1 relative flex flex-col">

<div className="p-6 lg:p-10 space-y-8">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div className="space-y-1">
<h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Operational Insights</h2>
<p className="text-slate-500 dark:text-slate-400">Real-time performance metrics and lead conversion data across all channels.</p>
</div>
<div className="flex items-center gap-3">
<button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
<span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                            Export PDF
                        </button>
<button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
<span className="material-symbols-outlined text-lg">csv</span>
                            Export CSV
                        </button>
</div>
</div>
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center shadow-sm">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-slate-400">calendar_today</span>
<select className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer">
<option>Last 30 Days</option>
<option>Last 7 Days</option>
<option>This Quarter</option>
<option>Custom Range</option>
</select>
</div>
<div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-slate-400">groups</span>
<select className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer">
<option>All Teams</option>
<option>Customer Support</option>
<option>Sales North</option>
<option>Operations</option>
</select>
</div>
<div className="ml-auto flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wider">
<span className="material-symbols-outlined text-sm">sync</span>
                        Live Data
                    </div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
<div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
<div className="flex items-center justify-between mb-8">
<h3 className="font-bold text-slate-800 dark:text-slate-200">Lead Conversion Funnel</h3>
<span className="material-symbols-outlined text-slate-400">info</span>
</div>
<div className="flex-1 flex flex-col justify-center items-center space-y-2">
<div className="w-full flex flex-col items-center gap-1">
<div className="w-full bg-primary/100 rounded-lg p-3 text-center text-white font-bold text-xs">VISITS (12,400)</div>
<div className="w-[85%] bg-primary/80 rounded-lg p-3 text-center text-white font-bold text-xs">LEADS (8,200)</div>
<div className="w-[70%] bg-primary/60 rounded-lg p-3 text-center text-white font-bold text-xs">PROPOSALS (4,100)</div>
<div className="w-[50%] bg-primary/40 rounded-lg p-3 text-center text-white font-bold text-xs">CLOSED (1,850)</div>
</div>
<div className="mt-8 grid grid-cols-2 gap-4 w-full pt-4 border-t border-slate-100 dark:border-slate-800">
<div>
<p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Conv. Rate</p>
<p className="text-2xl font-black text-slate-900 dark:text-white">14.9%</p>
</div>
<div className="text-right">
<p className="text-xs text-orange-600 dark:text-orange-400 font-bold flex items-center justify-end">
<span className="material-symbols-outlined text-sm">trending_up</span> +2.4%
                                    </p>
<p className="text-xs text-slate-400">vs last month</p>
</div>
</div>
</div>
</div>
<div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<div className="flex items-center justify-between mb-6">
<h3 className="font-bold text-slate-800 dark:text-slate-200">Agent Performance (Tickets vs Target)</h3>
<div className="flex gap-4 text-xs">
<div className="flex items-center gap-1"><span className="w-3 h-3 bg-primary rounded-sm"></span> Resolved</div>
<div className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-sm"></span> Target</div>
</div>
</div>
<div className="space-y-5">
<div className="space-y-2">
<div className="flex justify-between items-end">
<span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sarah Jenkins</span>
<span className="text-xs font-bold text-slate-500">142 / 120</span>
</div>
<div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div className="absolute h-full bg-primary rounded-full z-10" style={{'width':'85%'}}></div>
<div className="absolute h-full bg-slate-300 dark:bg-slate-600 rounded-full opacity-40" style={{'width':'70%'}}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between items-end">
<span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Michael Chen</span>
<span className="text-xs font-bold text-slate-500">115 / 120</span>
</div>
<div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div className="absolute h-full bg-primary rounded-full z-10" style={{'width':'68%'}}></div>
<div className="absolute h-full bg-slate-300 dark:bg-slate-600 rounded-full opacity-40" style={{'width':'70%'}}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between items-end">
<span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Emma Rodriguez</span>
<span className="text-xs font-bold text-slate-500">158 / 120</span>
</div>
<div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div className="absolute h-full bg-primary rounded-full z-10" style={{'width':'94%'}}></div>
<div className="absolute h-full bg-slate-300 dark:bg-slate-600 rounded-full opacity-40" style={{'width':'70%'}}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between items-end">
<span className="text-sm font-semibold text-slate-700 dark:text-slate-300">David Park</span>
<span className="text-xs font-bold text-slate-500">98 / 120</span>
</div>
<div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div className="absolute h-full bg-primary rounded-full z-10" style={{'width':'55%'}}></div>
<div className="absolute h-full bg-slate-300 dark:bg-slate-600 rounded-full opacity-40" style={{'width':'70%'}}></div>
</div>
</div>
</div>
</div>
<div className="lg:col-span-12 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<div className="flex items-center justify-between mb-8">
<div>
<h3 className="font-bold text-slate-800 dark:text-slate-200">Daily Traffic Trend</h3>
<p className="text-xs text-slate-500">Hourly ticket volume breakdown by weekday</p>
</div>
<div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
<div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary"></span> Traffic Volume</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
<div className="space-y-3">
<div className="flex justify-between items-center">
<span className="text-xs font-bold text-slate-500 uppercase">Monday</span>
<span className="text-[10px] font-bold text-primary">Avg: 42/hr</span>
</div>
<div className="h-32 w-full bg-slate-50/50 dark:bg-slate-800/50 rounded flex items-end relative px-1 pb-6 pt-2 border border-slate-100 dark:border-slate-800">
<div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between pointer-events-none opacity-20">
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
</div>
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
<path className="chart-line" d="M0,35 Q10,30 20,38 T40,20 T60,5 T80,15 T100,25" fill="none" stroke="#f97415" strokeWidth="2"></path>
</svg>
<div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[8px] font-bold text-slate-400">
<span>12AM</span><span>12PM</span><span>11PM</span>
</div>
</div>
</div>
<div className="space-y-3">
<div className="flex justify-between items-center">
<span className="text-xs font-bold text-slate-500 uppercase">Tuesday</span>
<span className="text-[10px] font-bold text-primary">Avg: 58/hr</span>
</div>
<div className="h-32 w-full bg-slate-50/50 dark:bg-slate-800/50 rounded flex items-end relative px-1 pb-6 pt-2 border border-slate-100 dark:border-slate-800">
<div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between pointer-events-none opacity-20">
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
</div>
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
<path className="chart-line" d="M0,38 Q10,35 20,30 T40,15 T60,2 T80,10 T100,20" fill="none" stroke="#f97415" strokeWidth="2"></path>
</svg>
<div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[8px] font-bold text-slate-400">
<span>12AM</span><span>12PM</span><span>11PM</span>
</div>
</div>
</div>
<div className="space-y-3">
<div className="flex justify-between items-center">
<span className="text-xs font-bold text-slate-500 uppercase">Wednesday</span>
<span className="text-[10px] font-bold text-primary">Avg: 51/hr</span>
</div>
<div className="h-32 w-full bg-slate-50/50 dark:bg-slate-800/50 rounded flex items-end relative px-1 pb-6 pt-2 border border-slate-100 dark:border-slate-800">
<div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between pointer-events-none opacity-20">
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
</div>
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
<path className="chart-line" d="M0,32 Q10,28 20,35 T40,25 T60,8 T80,12 T100,30" fill="none" stroke="#f97415" strokeWidth="2"></path>
</svg>
<div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[8px] font-bold text-slate-400">
<span>12AM</span><span>12PM</span><span>11PM</span>
</div>
</div>
</div>
<div className="space-y-3">
<div className="flex justify-between items-center">
<span className="text-xs font-bold text-slate-500 uppercase">Thursday</span>
<span className="text-[10px] font-bold text-primary">Avg: 64/hr</span>
</div>
<div className="h-32 w-full bg-slate-50/50 dark:bg-slate-800/50 rounded flex items-end relative px-1 pb-6 pt-2 border border-slate-100 dark:border-slate-800">
<div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between pointer-events-none opacity-20">
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
</div>
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
<path className="chart-line" d="M0,35 Q10,32 20,25 T40,10 T60,1 T80,5 T100,15" fill="none" stroke="#f97415" strokeWidth="2"></path>
</svg>
<div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[8px] font-bold text-slate-400">
<span>12AM</span><span>12PM</span><span>11PM</span>
</div>
</div>
</div>
<div className="space-y-3">
<div className="flex justify-between items-center">
<span className="text-xs font-bold text-slate-500 uppercase">Friday</span>
<span className="text-[10px] font-bold text-primary">Avg: 72/hr</span>
</div>
<div className="h-32 w-full bg-slate-50/50 dark:bg-slate-800/50 rounded flex items-end relative px-1 pb-6 pt-2 border border-slate-100 dark:border-slate-800">
<div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between pointer-events-none opacity-20">
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
<div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
</div>
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
<path className="chart-line" d="M0,38 Q10,30 20,20 T40,5 T60,0 T80,2 T100,10" fill="none" stroke="#f97415" strokeWidth="2"></path>
</svg>
<div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[8px] font-bold text-slate-400">
<span>12AM</span><span>12PM</span><span>11PM</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>

</div></div></>
  );
}