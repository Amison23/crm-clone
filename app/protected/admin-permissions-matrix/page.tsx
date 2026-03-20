export default function AdminPermissionsMatrix() {
  return (
    <>
      
<div className="flex h-screen overflow-hidden">
{/*  Sidebar  */}

{/*  Main Content  */}
<div className="w-full flex-1 relative flex flex-col">
{/*  Top Header  */}

{/*  Page Content  */}
<div className="flex-1 overflow-y-auto p-8">
<div className="mb-8">
<h1 className="text-3xl font-black tracking-tight mb-2">Permissions Matrix</h1>
<p className="text-slate-500 dark:text-slate-400">Configure role-based access control (RBAC) across system modules.</p>
</div>
{/*  Role Selection Tabs  */}
<div className="border-b border-slate-200 dark:border-slate-800 mb-8 flex gap-8 overflow-x-auto">
<button className="border-b-2 border-primary text-primary px-4 py-4 text-sm font-bold whitespace-nowrap">Super Admin</button>
<button className="border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-4 py-4 text-sm font-bold transition-all whitespace-nowrap">Company Admin</button>
<button className="border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-4 py-4 text-sm font-bold transition-all whitespace-nowrap">Sales Agent</button>
<button className="border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-4 py-4 text-sm font-bold transition-all whitespace-nowrap">Server Admin</button>
</div>
{/*  Permissions Table Card  */}
<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-slate-50 dark:bg-slate-800/50">
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 min-w-[240px]">Module Name</th>
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 text-center">Enable</th>
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 text-center">Read</th>
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 text-center">Write</th>
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 text-center">Delete</th>
<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 text-center">Export</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
{/*  Row: CRM  */}
<tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="size-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
<span className="material-symbols-outlined text-lg">contacts</span>
</div>
<div>
<p className="font-semibold text-sm">CRM</p>
<p className="text-xs text-slate-400">Manage customer relationships</p>
</div>
</div>
</td>
<td className="px-6 py-5 text-center">
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
</tr>
{/*  Row: Chat  */}
<tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="size-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
<span className="material-symbols-outlined text-lg">forum</span>
</div>
<div>
<p className="font-semibold text-sm">Chat</p>
<p className="text-xs text-slate-400">Real-time internal messaging</p>
</div>
</div>
</td>
<td className="px-6 py-5 text-center">
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
</tr>
{/*  Row: Support  */}
<tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
<span className="material-symbols-outlined text-lg">support_agent</span>
</div>
<div>
<p className="font-semibold text-sm">Support</p>
<p className="text-xs text-slate-400">Helpdesk and ticketing</p>
</div>
</div>
</td>
<td className="px-6 py-5 text-center">
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
</tr>
{/*  Row: Admin Settings  */}
<tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
<span className="material-symbols-outlined text-lg">settings_applications</span>
</div>
<div>
<p className="font-semibold text-sm">Admin Settings</p>
<p className="text-xs text-slate-400">System configuration tools</p>
</div>
</div>
</td>
<td className="px-6 py-5 text-center">
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input defaultChecked className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
</tr>
{/*  Row: Telephony  */}
<tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="size-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
<span className="material-symbols-outlined text-lg">call</span>
</div>
<div>
<p className="font-semibold text-sm">Telephony</p>
<p className="text-xs text-slate-400">Voice and call routing</p>
</div>
</div>
</td>
<td className="px-6 py-5 text-center">
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</td>
<td className="px-6 py-5 text-center">
<input className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
<td className="px-6 py-5 text-center">
<input className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
<p className="text-xs text-slate-500 font-medium">Last updated: Oct 24, 2023 - 14:32 PM</p>
<div className="flex gap-3">
<button className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Discard Changes</button>
<button className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all">Save Permissions</button>
</div>
</div>
</div>
{/*  Footer Section  */}
<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-4">
<div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-primary">
<span className="material-symbols-outlined">history</span>
</div>
<div>
<h4 className="font-bold text-sm mb-1">Audit Logs</h4>
<p className="text-xs text-slate-500">Review all historical permission changes for compliance.</p>
<a className="inline-block mt-3 text-xs font-bold text-primary hover:underline" href="#">View History →</a>
</div>
</div>
<div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-4">
<div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-emerald-600 dark:text-emerald-400">
<span className="material-symbols-outlined">security</span>
</div>
<div>
<h4 className="font-bold text-sm mb-1">Security Score</h4>
<p className="text-xs text-slate-500">Current RBAC configuration adheres to best practices.</p>
<div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 w-[92%]"></div>
</div>
</div>
</div>
<div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-4">
<div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-amber-600 dark:text-amber-400">
<span className="material-symbols-outlined">group_add</span>
</div>
<div>
<h4 className="font-bold text-sm mb-1">Quick Invite</h4>
<p className="text-xs text-slate-500">Quickly add a new administrator with pre-defined roles.</p>
<a className="inline-block mt-3 text-xs font-bold text-primary hover:underline" href="#">Invite User →</a>
</div>
</div>
</div>
</div>
</div></div></>
  );
}