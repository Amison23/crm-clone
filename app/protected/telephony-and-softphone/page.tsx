export default function TelephonyAndSoftphone() {
  return (
    <>
      
<div className="w-full h-full flex flex-col">
{/*  Sidebar  */}

{/*  Main Content  */}
<div className="w-full flex-1 relative flex flex-col">
{/*  Header  */}

{/*  Stats Bar  */}
<div className="grid grid-cols-4 gap-6 mb-8">
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Calls Today</p>
<p className="text-2xl font-black text-slate-900 dark:text-white">1,284</p>
</div>
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Missed Calls</p>
<p className="text-2xl font-black text-red-500">24</p>
</div>
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Avg. Duration</p>
<p className="text-2xl font-black text-slate-900 dark:text-white">4m 12s</p>
</div>
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Lines</p>
<p className="text-2xl font-black text-emerald-500">8 / 12</p>
</div>
</div>
{/*  Tabs  */}
<div className="border-b border-slate-200 dark:border-slate-800 mb-6 flex gap-8">
<button className="pb-4 border-b-2 border-primary text-primary text-sm font-bold">Call History</button>
<button className="pb-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium">Virtual Numbers</button>
<button className="pb-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium">Voicemail</button>
<button className="pb-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium">Recordings</button>
</div>
{/*  Main Table Section  */}
<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
<table className="w-full text-left">
<thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
<tr>
<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Number</th>
<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Name</th>
<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Playback</th>
<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</th>
<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
<tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase">
<span className="material-symbols-outlined text-[14px]">call_received</span>
                                    Inbound
                                </span>
</td>
<td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">+1 555-0102</td>
<td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-semibold">Jane Cooper</td>
<td className="px-6 py-4 text-sm text-slate-500">04:20</td>
<td className="px-6 py-4">
<button className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-bold group">
<span className="material-symbols-outlined text-[20px]">play_circle</span>
                                    Play
                                </button>
</td>
<td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">Follow up regarding the quarterly billing cycle...</td>
<td className="px-6 py-4 text-right">
<button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
<span className="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 uppercase">
<span className="material-symbols-outlined text-[14px]">call_missed</span>
                                    Missed
                                </span>
</td>
<td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">+1 555-0199</td>
<td className="px-6 py-4 text-sm text-slate-400 italic">Unknown</td>
<td className="px-6 py-4 text-sm text-slate-500">00:00</td>
<td className="px-6 py-4 text-slate-300 dark:text-slate-700">
<span className="material-symbols-outlined text-[20px]">play_disabled</span>
</td>
<td className="px-6 py-4 text-sm text-slate-400">—</td>
<td className="px-6 py-4 text-right">
<button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
<span className="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase">
<span className="material-symbols-outlined text-[14px]">call_made</span>
                                    Outbound
                                </span>
</td>
<td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">+1 555-0143</td>
<td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-semibold">Robert Fox</td>
<td className="px-6 py-4 text-sm text-slate-500">12:15</td>
<td className="px-6 py-4">
<button className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-bold group">
<span className="material-symbols-outlined text-[20px]">play_circle</span>
                                    Play
                                </button>
</td>
<td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">Project update and milestone discussion...</td>
<td className="px-6 py-4 text-right">
<button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
<span className="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase">
<span className="material-symbols-outlined text-[14px]">call_received</span>
                                    Inbound
                                </span>
</td>
<td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">+1 555-0178</td>
<td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-semibold">Esther Howard</td>
<td className="px-6 py-4 text-sm text-slate-500">01:45</td>
<td className="px-6 py-4">
<button className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-bold group">
<span className="material-symbols-outlined text-[20px]">play_circle</span>
                                    Play
                                </button>
</td>
<td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">Confirmed meeting for next Friday.</td>
<td className="px-6 py-4 text-right">
<button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
<span className="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
{/*  Floating Softphone UI  */}
<div className="fixed bottom-8 right-8 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50">
{/*  Softphone Header (Active Call State)  */}
<div className="bg-primary p-4 text-white">
<div className="flex items-center justify-between mb-4">
<span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Active Call</span>
<div className="flex gap-2">
<span className="material-symbols-outlined text-[18px] cursor-pointer">settings</span>
<span className="material-symbols-outlined text-[18px] cursor-pointer">minimize</span>
</div>
</div>
<div className="flex flex-col items-center text-center">
<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 border-2 border-white/30">
<span className="material-symbols-outlined text-[32px]">person</span>
</div>
<h3 className="text-lg font-bold">Jane Cooper</h3>
<p className="text-sm opacity-90">+1 555-0102</p>
<div className="mt-2 py-1 px-3 bg-white/20 rounded-full text-xs font-mono font-bold">
                            04:20
                        </div>
</div>
</div>
{/*  Call Controls  */}
<div className="p-6">
<div className="grid grid-cols-3 gap-4 mb-6">
<button className="flex flex-col items-center gap-1 group">
<div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
<span className="material-symbols-outlined text-slate-600 dark:text-slate-400">mic_off</span>
</div>
<span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Mute</span>
</button>
<button className="flex flex-col items-center gap-1 group">
<div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
<span className="material-symbols-outlined text-slate-600 dark:text-slate-400">pause</span>
</div>
<span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Hold</span>
</button>
<button className="flex flex-col items-center gap-1 group">
<div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
<span className="material-symbols-outlined text-slate-600 dark:text-slate-400">forward</span>
</div>
<span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Transfer</span>
</button>
<button className="flex flex-col items-center gap-1 group">
<div className="w-12 h-12 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
<span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>fiber_manual_record</span>
</div>
<span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Recording</span>
</button>
<button className="flex flex-col items-center gap-1 group">
<div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
<span className="material-symbols-outlined text-slate-600 dark:text-slate-400">apps</span>
</div>
<span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Keypad</span>
</button>
<button className="flex flex-col items-center gap-1 group">
<div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
<span className="material-symbols-outlined text-slate-600 dark:text-slate-400">add_call</span>
</div>
<span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Add</span>
</button>
</div>
{/*  End Call Button  */}
<button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all">
<span className="material-symbols-outlined">call_end</span>
                        End Call
                    </button>
</div>
{/*  Notes Shortcut  */}
<div className="px-6 pb-4">
<div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
<p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Live Notes</p>
<textarea className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-700 dark:text-slate-300 placeholder:text-slate-400" placeholder="Type notes here..." rows={2}></textarea>
</div>
</div>
</div>
</div></div></>
  );
}