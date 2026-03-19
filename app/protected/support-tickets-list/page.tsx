export default function SupportTicketsList() {
  return (
    <>
      
<div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
<div className="layout-container flex h-full grow flex-col">
{/*  Header  */}
<header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 lg:px-10">
<div className="flex items-center gap-8">
<div className="flex items-center gap-3">
<div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white">
<span className="material-symbols-outlined">confirmation_number</span>
</div>
<h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">SupportHub</h2>
</div>
<label className="hidden md:flex flex-col min-w-40 h-10 max-w-64">
<div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
<div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-3">
<span className="material-symbols-outlined text-xl">search</span>
</div>
<input className="flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-slate-500 text-sm" placeholder="Search tickets..." value="" />
</div>
</label>
</div>
<div className="flex flex-1 justify-end gap-4 items-center">
<button className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold transition-all hover:opacity-90">
<span className="material-symbols-outlined text-xl">add</span>
<span className="truncate">New Ticket</span>
</button>
<div className="relative">
<div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-slate-200 dark:border-slate-700" data-alt="User profile avatar of a professional support agent" style={{backgroundImage: 'url("https://ui-avatars.com/api/?name=User&background=random")'}}></div>
<div className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></div>
</div>
</div>
</header>
<div className="flex flex-1">
{/*  Sidebar  */}
<aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shrink-0">
<div className="flex flex-col gap-1">
<div className="mb-4 px-3 py-2">
<h1 className="text-slate-900 dark:text-slate-100 text-base font-bold">Support Center</h1>
<p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Administrator Panel</p>
</div>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 group" href="#">
<span className="material-symbols-outlined">dashboard</span>
<p className="text-sm font-medium">Dashboard</p>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary" href="#">
<span className="material-symbols-outlined">confirmation_number</span>
<p className="text-sm font-bold">Tickets</p>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800" href="#">
<span className="material-symbols-outlined">group</span>
<p className="text-sm font-medium">Customers</p>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800" href="#">
<span className="material-symbols-outlined">bar_chart</span>
<p className="text-sm font-medium">Reports</p>
</a>
<div className="mt-8 mb-2 px-3 text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">System</div>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800" href="#">
<span className="material-symbols-outlined">settings</span>
<p className="text-sm font-medium">Settings</p>
</a>
</div>
</aside>
{/*  Main Content  */}
<main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark min-w-0">
<div className="flex flex-col gap-6 p-6 lg:p-10">
{/*  Content Header  */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
<div className="flex flex-col gap-1">
<h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-tight">Support Tickets</h1>
<p className="text-slate-500 dark:text-slate-400 text-base font-normal">Track and manage active customer support requests</p>
</div>
<div className="flex gap-2">
<button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
<span className="material-symbols-outlined text-xl">ios_share</span>
                                    Export
                                </button>
</div>
</div>
{/*  Filters  */}
<div className="flex flex-wrap items-center gap-2">
<button className="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-primary text-white px-4">
<p className="text-sm font-semibold">All Tickets</p>
</button>
<button className="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300">
<p className="text-sm font-medium">Open</p>
<span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">12</span>
</button>
<button className="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300">
<p className="text-sm font-medium">Pending</p>
<span className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">5</span>
</button>
<button className="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300">
<p className="text-sm font-medium">Resolved</p>
</button>
<div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>
<button className="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-300">
<span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
<p className="text-sm font-medium">More Filters</p>
</button>
</div>
{/*  Ticket Table  */}
<div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
<div className="overflow-x-auto @container">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-slate-50 dark:bg-slate-800/50">
<th className="px-6 py-4 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                                Ticket ID
                                            </th>
<th className="px-6 py-4 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                                Subject
                                            </th>
<th className="px-6 py-4 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                                Status
                                            </th>
<th className="px-6 py-4 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                                Priority
                                            </th>
<th className="px-6 py-4 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                                SLA Status
                                            </th>
<th className="px-6 py-4 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                                Agent
                                            </th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
{/*  Row 1  */}
<tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td className="px-6 py-4 text-slate-900 dark:text-slate-100 text-sm font-bold">#TK-1024</td>
<td className="px-6 py-4">
<div className="flex flex-col">
<span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Login issue on mobile app</span>
<span className="text-slate-500 dark:text-slate-400 text-xs">Customer: Alice Cooper • 2h ago</span>
</div>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                                    Open
                                                </span>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                    Urgent
                                                </span>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
<span className="size-1.5 rounded-full bg-red-600 dark:bg-red-400 animate-pulse"></span>
                                                    Overdue
                                                </span>
</td>
<td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-medium">
                                                John Doe
                                            </td>
</tr>
{/*  Row 2  */}
<tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td className="px-6 py-4 text-slate-900 dark:text-slate-100 text-sm font-bold">#TK-1025</td>
<td className="px-6 py-4">
<div className="flex flex-col">
<span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Payment gateway timeout</span>
<span className="text-slate-500 dark:text-slate-400 text-xs">Customer: Bob Marley • 4h ago</span>
</div>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                    Pending
                                                </span>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                                    High
                                                </span>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
<span className="size-1.5 rounded-full bg-amber-600 dark:bg-amber-400"></span>
                                                    At risk
                                                </span>
</td>
<td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-medium">
                                                Jane Smith
                                            </td>
</tr>
{/*  Row 3  */}
<tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td className="px-6 py-4 text-slate-900 dark:text-slate-100 text-sm font-bold">#TK-1026</td>
<td className="px-6 py-4">
<div className="flex flex-col">
<span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Update billing address</span>
<span className="text-slate-500 dark:text-slate-400 text-xs">Customer: Charlie Sheen • 1d ago</span>
</div>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                    Resolved
                                                </span>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                                    Low
                                                </span>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
<span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                                                    On track
                                                </span>
</td>
<td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-medium">
                                                Mike Ross
                                            </td>
</tr>
{/*  Row 4  */}
<tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td className="px-6 py-4 text-slate-900 dark:text-slate-100 text-sm font-bold">#TK-1027</td>
<td className="px-6 py-4">
<div className="flex flex-col">
<span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Feature request: Dark mode</span>
<span className="text-slate-500 dark:text-slate-400 text-xs">Customer: Diana Prince • 2d ago</span>
</div>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                                    Open
                                                </span>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                                                    Medium
                                                </span>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
<span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                                                    On track
                                                </span>
</td>
<td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-medium">
                                                Sarah Connor
                                            </td>
</tr>
</tbody>
</table>
</div>
{/*  Pagination  */}
<div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4">
<div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Showing <span className="text-slate-900 dark:text-slate-100">1 to 4</span> of <span className="text-slate-900 dark:text-slate-100">24</span> tickets
                                </div>
<div className="flex items-center gap-2">
<button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30" disabled>
<span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
</button>
<button className="size-8 rounded bg-primary text-white text-xs font-bold">1</button>
<button className="size-8 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-medium">2</button>
<button className="size-8 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-medium">3</button>
<button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800">
<span className="material-symbols-outlined text-lg leading-none">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</main>
</div>
</div>
</div>

    </>
  );
}