export default function CrmLeadsTable() {
  return (
    <>
      
<div className="flex h-screen overflow-hidden">
{/*  Sidebar  */}

{/*  Main Content  */}
<div className="w-full flex-1 relative flex flex-col">
{/*  Header  */}

{/*  Content Area  */}
<div className="flex-1 overflow-auto p-8 space-y-6">
{/*  Filters  */}
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2 cursor-pointer hover:border-primary/50">
<span className="text-xs font-medium text-slate-500">Status:</span>
<span className="text-xs font-bold">All Leads</span>
<span className="material-symbols-outlined text-sm">expand_more</span>
</div>
<div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2 cursor-pointer hover:border-primary/50">
<span className="text-xs font-medium text-slate-500">Agent:</span>
<span className="text-xs font-bold">All Agents</span>
<span className="material-symbols-outlined text-sm">expand_more</span>
</div>
<div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2 cursor-pointer hover:border-primary/50">
<span className="text-xs font-medium text-slate-500">Source:</span>
<span className="text-xs font-bold">All Sources</span>
<span className="material-symbols-outlined text-sm">expand_more</span>
</div>
<button className="text-primary text-xs font-semibold hover:underline px-2">Clear filters</button>
</div>
<div className="text-xs text-slate-500">
                    Showing <span className="font-bold text-slate-900 dark:text-slate-100">142</span> leads
                </div>
</div>
{/*  Table Card  */}
<div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
<th className="p-4 w-12 text-center">
<input className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" type="checkbox" />
</th>
<th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Lead Name</th>
<th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
<th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Source</th>
<th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Agent</th>
<th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Last Contacted</th>
<th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
{/*  Row 1  */}
<tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
<td className="p-4 text-center">
<input className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" type="checkbox" />
</td>
<td className="p-4">
<div className="flex items-center gap-3">
<div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary font-bold text-xs">JD</div>
<div>
<p className="text-sm font-semibold">Johnathan Doe</p>
<p className="text-[11px] text-slate-500">john.doe@gmail.com</p>
</div>
</div>
</td>
<td className="p-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                New
                            </span>
</td>
<td className="p-4 text-sm text-slate-600 dark:text-slate-400">Web</td>
<td className="p-4">
<div className="flex items-center gap-2">
<div className="size-6 rounded-full bg-slate-200 dark:bg-slate-800 bg-cover bg-center" data-alt="Agent Sarah avatar" style={{}}></div>
<span className="text-sm">Sarah Smith</span>
</div>
</td>
<td className="p-4 text-sm text-slate-600 dark:text-slate-400">Oct 24, 2023</td>
<td className="p-4">
<div className="flex items-center gap-1">
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="View Details">
<span className="material-symbols-outlined text-lg">visibility</span>
</button>
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Call Lead">
<span className="material-symbols-outlined text-lg">call</span>
</button>
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Edit">
<span className="material-symbols-outlined text-lg">edit</span>
</button>
</div>
</td>
</tr>
{/*  Row 2  */}
<tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
<td className="p-4 text-center">
<input className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" type="checkbox" />
</td>
<td className="p-4">
<div className="flex items-center gap-3">
<div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary font-bold text-xs">AM</div>
<div>
<p className="text-sm font-semibold">Alice Miller</p>
<p className="text-[11px] text-slate-500">alice.m@outlook.com</p>
</div>
</div>
</td>
<td className="p-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-primary dark:bg-orange-900/30">
                                Contacted
                            </span>
</td>
<td className="p-4 text-sm text-slate-600 dark:text-slate-400">Referral</td>
<td className="p-4">
<div className="flex items-center gap-2">
<div className="size-6 rounded-full bg-slate-200 dark:bg-slate-800 bg-cover bg-center" data-alt="Agent Mike avatar" style={{}}></div>
<span className="text-sm">Mike Jones</span>
</div>
</td>
<td className="p-4 text-sm text-slate-600 dark:text-slate-400">Oct 23, 2023</td>
<td className="p-4">
<div className="flex items-center gap-1">
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="View Details">
<span className="material-symbols-outlined text-lg">visibility</span>
</button>
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Call Lead">
<span className="material-symbols-outlined text-lg">call</span>
</button>
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Edit">
<span className="material-symbols-outlined text-lg">edit</span>
</button>
</div>
</td>
</tr>
{/*  Row 3  */}
<tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
<td className="p-4 text-center">
<input className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" type="checkbox" />
</td>
<td className="p-4">
<div className="flex items-center gap-3">
<div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary font-bold text-xs">RB</div>
<div>
<p className="text-sm font-semibold">Robert Brown</p>
<p className="text-[11px] text-slate-500">r.brown@company.io</p>
</div>
</div>
</td>
<td className="p-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                Qualified
                            </span>
</td>
<td className="p-4 text-sm text-slate-600 dark:text-slate-400">Ad</td>
<td className="p-4">
<div className="flex items-center gap-2">
<div className="size-6 rounded-full bg-slate-200 dark:bg-slate-800 bg-cover bg-center" data-alt="Agent Sarah avatar" style={{}}></div>
<span className="text-sm">Sarah Smith</span>
</div>
</td>
<td className="p-4 text-sm text-slate-600 dark:text-slate-400">Oct 22, 2023</td>
<td className="p-4">
<div className="flex items-center gap-1">
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="View Details">
<span className="material-symbols-outlined text-lg">visibility</span>
</button>
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Call Lead">
<span className="material-symbols-outlined text-lg">call</span>
</button>
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Edit">
<span className="material-symbols-outlined text-lg">edit</span>
</button>
</div>
</td>
</tr>
{/*  Row 4  */}
<tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
<td className="p-4 text-center">
<input className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" type="checkbox" />
</td>
<td className="p-4">
<div className="flex items-center gap-3">
<div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary font-bold text-xs">EW</div>
<div>
<p className="text-sm font-semibold">Emily White</p>
<p className="text-[11px] text-slate-500">e.white@gmail.com</p>
</div>
</div>
</td>
<td className="p-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                Lost
                            </span>
</td>
<td className="p-4 text-sm text-slate-600 dark:text-slate-400">Web</td>
<td className="p-4">
<div className="flex items-center gap-2">
<div className="size-6 rounded-full bg-slate-200 dark:bg-slate-800 bg-cover bg-center" data-alt="Agent Mike avatar" style={{}}></div>
<span className="text-sm">Mike Jones</span>
</div>
</td>
<td className="p-4 text-sm text-slate-600 dark:text-slate-400">Oct 21, 2023</td>
<td className="p-4">
<div className="flex items-center gap-1">
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="View Details">
<span className="material-symbols-outlined text-lg">visibility</span>
</button>
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Call Lead">
<span className="material-symbols-outlined text-lg">call</span>
</button>
<button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Edit">
<span className="material-symbols-outlined text-lg">edit</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
{/*  Pagination  */}
<div className="p-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
<div className="text-xs text-slate-500">
                        Page 1 of 12
                    </div>
<div className="flex items-center gap-1">
<button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-white dark:hover:bg-slate-900">
<span className="material-symbols-outlined text-sm">chevron_left</span>
</button>
<button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">1</button>
<button className="size-8 flex items-center justify-center rounded-lg text-xs font-medium hover:bg-white dark:hover:bg-slate-900">2</button>
<button className="size-8 flex items-center justify-center rounded-lg text-xs font-medium hover:bg-white dark:hover:bg-slate-900">3</button>
<span className="px-1 text-slate-400 text-xs">...</span>
<button className="size-8 flex items-center justify-center rounded-lg text-xs font-medium hover:bg-white dark:hover:bg-slate-900">12</button>
<button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-white dark:hover:bg-slate-900">
<span className="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</div></div></>
  );
}