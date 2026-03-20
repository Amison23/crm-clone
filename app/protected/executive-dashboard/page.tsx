export default function ExecutiveDashboard() {
  return (
    <>
      
<div className="w-full h-full flex flex-col">
{/*  Sidebar Navigation  */}

{/*  Main Content Area  */}
<div className="w-full h-full flex flex-col">
{/*  Top Navigation Bar  */}

{/*  Dashboard Content  */}
<div className="p-6 lg:p-8 flex flex-col gap-8">
{/*  Welcome Section  */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div>
<h1 className="text-3xl font-black tracking-tight">Executive Dashboard</h1>
<p className="text-slate-500 dark:text-slate-400 mt-1">Global performance overview for all active tenants.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
<span className="material-symbols-outlined text-lg">calendar_today</span>
<span>Last 30 Days</span>
</button>
<button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
<span className="material-symbols-outlined text-lg">filter_alt</span>
<span>Filter</span>
</button>
</div>
</div>
{/*  KPI Cards  */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-primary rounded-lg">
<span className="material-symbols-outlined">person_add</span>
</div>
<span className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
<span className="material-symbols-outlined text-xs">trending_up</span> 12.5%
                            </span>
</div>
<p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Leads</p>
<p className="text-2xl font-bold mt-1">12,840</p>
</div>
<div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
<span className="material-symbols-outlined">badge</span>
</div>
<span className="flex items-center gap-1 text-rose-500 text-xs font-bold bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-full">
<span className="material-symbols-outlined text-xs">trending_down</span> 2.1%
                            </span>
</div>
<p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Clients</p>
<p className="text-2xl font-bold mt-1">3,420</p>
</div>
<div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
<span className="material-symbols-outlined">confirmation_number</span>
</div>
<span className="flex items-center gap-1 text-rose-500 text-xs font-bold bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-full">
<span className="material-symbols-outlined text-xs">trending_down</span> 5.4%
                            </span>
</div>
<p className="text-sm font-medium text-slate-500 dark:text-slate-400">Open Tickets</p>
<p className="text-2xl font-bold mt-1">158</p>
</div>
<div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-primary/10 text-primary rounded-lg">
<span className="material-symbols-outlined">payments</span>
</div>
<span className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
<span className="material-symbols-outlined text-xs">trending_up</span> 8.2%
                            </span>
</div>
<p className="text-sm font-medium text-slate-500 dark:text-slate-400">Revenue</p>
<p className="text-2xl font-bold mt-1">$420,500</p>
</div>
</div>
{/*  Main Section: Charts and Activity  */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
{/*  Performance Chart  */}
<div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
<div className="flex items-center justify-between mb-8">
<div>
<h3 className="font-bold text-lg">Lead Conversion Over Time</h3>
<p className="text-sm text-slate-500">64% average conversion rate</p>
</div>
<div className="flex gap-2">
<button className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary/10 text-primary">Monthly</button>
<button className="px-3 py-1 text-xs font-semibold rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Weekly</button>
</div>
</div>
<div className="h-[300px] w-full relative">
{/*  SVG Chart Simulation  */}
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
<defs>
<linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#f97415" stopOpacity="0.2"></stop>
<stop offset="100%" stopColor="#f97415" stopOpacity="0"></stop>
</linearGradient>
</defs>
<path d="M0,150 Q50,140 100,160 T200,80 T300,100 T400,40 T500,60 L500,200 L0,200 Z" fill="url(#chartGradient)"></path>
<path d="M0,150 Q50,140 100,160 T200,80 T300,100 T400,40 T500,60" fill="none" stroke="#f97415" strokeLinecap="round" strokeWidth="3"></path>
{/*  Chart Points  */}
<circle cx="100" cy="160" fill="#f97415" r="4" stroke="white" strokeWidth="2"></circle>
<circle cx="200" cy="80" fill="#f97415" r="4" stroke="white" strokeWidth="2"></circle>
<circle cx="300" cy="100" fill="#f97415" r="4" stroke="white" strokeWidth="2"></circle>
<circle cx="400" cy="40" fill="#f97415" r="4" stroke="white" strokeWidth="2"></circle>
</svg>
{/*  X Axis Labels  */}
<div className="flex justify-between mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
<span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
</div>
</div>
</div>
{/*  Quick Actions & Tasks  */}
<div className="flex flex-col gap-6">
{/*  Quick Actions  */}
<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
<h3 className="font-bold text-lg mb-4">Quick Actions</h3>
<div className="grid grid-cols-2 gap-3">
<button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all group">
<span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">person_add</span>
<span className="text-xs font-semibold">New Lead</span>
</button>
<button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all group">
<span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">confirmation_number</span>
<span className="text-xs font-semibold">New Ticket</span>
</button>
<button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all group">
<span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">campaign</span>
<span className="text-xs font-semibold">Announce</span>
</button>
<button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all group">
<span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">cloud_upload</span>
<span className="text-xs font-semibold">Bulk Import</span>
</button>
</div>
</div>
{/*  Tasks Summary  */}
<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex-1">
<div className="flex items-center justify-between mb-4">
<h3 className="font-bold text-lg">My Tasks</h3>
<a className="text-xs font-bold text-primary hover:underline" href="#">View All</a>
</div>
<div className="space-y-4">
<div className="flex items-start gap-3">
<div className="mt-1">
<div className="size-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-primary cursor-pointer"></div>
</div>
<div className="flex-1">
<p className="text-sm font-medium line-through text-slate-400">Review monthly SLA reports</p>
<p className="text-[11px] text-slate-400">Completed 2h ago</p>
</div>
</div>
<div className="flex items-start gap-3">
<div className="mt-1">
<div className="size-5 rounded border-2 border-primary flex items-center justify-center cursor-pointer">
<span className="material-symbols-outlined text-primary text-[14px] font-bold">check</span>
</div>
</div>
<div className="flex-1">
<p className="text-sm font-medium">Approve tenant migration: Acme Corp</p>
<p className="text-[11px] text-rose-500 font-bold">Due today</p>
</div>
</div>
<div className="flex items-start gap-3">
<div className="mt-1">
<div className="size-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-primary cursor-pointer"></div>
</div>
<div className="flex-1">
<p className="text-sm font-medium">Update telephony gateway settings</p>
<p className="text-[11px] text-slate-400">Due in 2 days</p>
</div>
</div>
</div>
</div>
</div>
</div>
{/*  Bottom Row: Recent Activity  */}
<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
<div className="flex items-center justify-between mb-6">
<h3 className="font-bold text-lg">Recent Activity Timeline</h3>
<button className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</div>
<div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
<div className="relative pl-8">
<div className="absolute left-0 top-1 size-[24px] rounded-full bg-primary border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[12px]">add</span>
</div>
<div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
<p className="text-sm"><span className="font-bold">New Tenant Onboarded:</span> "TechFlow Solutions" joined the platform.</p>
<span className="text-xs text-slate-400 whitespace-nowrap">12 minutes ago</span>
</div>
</div>
<div className="relative pl-8">
<div className="absolute left-0 top-1 size-[24px] rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[12px]">check_circle</span>
</div>
<div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
<p className="text-sm"><span className="font-bold">System Maintenance:</span> Database optimization successfully completed.</p>
<span className="text-xs text-slate-400 whitespace-nowrap">1 hour ago</span>
</div>
</div>
<div className="relative pl-8">
<div className="absolute left-0 top-1 size-[24px] rounded-full bg-amber-500 border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[12px]">warning</span>
</div>
<div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
<p className="text-sm"><span className="font-bold">High Load Alert:</span> Telephony server Node-4 reached 90% capacity.</p>
<span className="text-xs text-slate-400 whitespace-nowrap">3 hours ago</span>
</div>
</div>
<div className="relative pl-8">
<div className="absolute left-0 top-1 size-[24px] rounded-full bg-slate-400 border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[12px]">mail</span>
</div>
<div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
<p className="text-sm"><span className="font-bold">Campaign Triggered:</span> Global "End of Quarter" drip campaign started.</p>
<span className="text-xs text-slate-400 whitespace-nowrap">5 hours ago</span>
</div>
</div>
</div>
</div>
</div>
{/*  Footer  */}

</div></div></>
  );
}