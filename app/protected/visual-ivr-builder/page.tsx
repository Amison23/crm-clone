export default function VisualIvrBuilder() {
  return (
    <>
      
<div className="relative flex h-screen w-full flex-col overflow-hidden">
{/*  TopNavBar  */}
<header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 shrink-0">
<div className="flex items-center gap-4">
<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
<span className="material-symbols-outlined text-xl">settings_input_component</span>
</div>
<div className="flex flex-col">
<h2 className="text-sm font-bold leading-tight tracking-tight">VoiceFlow Architect</h2>
<div className="flex items-center gap-1">
<span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Project:</span>
<span className="text-[10px] font-bold text-primary uppercase">Support_Main_v2</span>
</div>
</div>
</div>
<nav className="hidden md:flex items-center gap-6">
<a className="text-sm font-semibold text-slate-900 dark:text-slate-100 border-b-2 border-primary pb-1" href="#">Flow Designer</a>
<a className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Phone Numbers</a>
<a className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Call Logs</a>
<a className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Analytics</a>
</nav>
<div className="flex items-center gap-3">
<button className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
<span className="material-symbols-outlined text-lg">play_circle</span>
<span>Test Flow</span>
</button>
<button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
<span className="material-symbols-outlined text-lg">publish</span>
<span>Publish</span>
</button>
<div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ml-2 border border-slate-300 dark:border-slate-600">
<img className="h-full w-full object-cover" alt="User profile avatar" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
</div>
</header>
<div className="flex flex-1 overflow-hidden">
{/*  Sidebar: Node Library  */}
<aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
<div className="p-4 border-b border-slate-100 dark:border-slate-800">
<h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Flow Components</h3>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
<input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Search nodes..." type="text" />
</div>
</div>
<div className="flex-1 overflow-y-auto p-4 space-y-2">
{/*  Node Category  */}
<div className="mb-6">
<p className="text-[11px] font-bold text-slate-400 uppercase mb-3 px-2">Triggers &amp; Inputs</p>
<div className="space-y-1">
<div className="group flex items-center gap-3 rounded-xl p-3 bg-primary/5 border border-primary/20 cursor-grab hover:border-primary transition-all">
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
<span className="material-symbols-outlined">call_received</span>
</div>
<div>
<p className="text-sm font-bold text-slate-900 dark:text-white">Incoming Call</p>
<p className="text-[11px] text-slate-500">Entry point node</p>
</div>
</div>
<div className="group flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent cursor-grab transition-all">
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
<span className="material-symbols-outlined">dialpad</span>
</div>
<div>
<p className="text-sm font-bold text-slate-900 dark:text-white">Menu Options</p>
<p className="text-[11px] text-slate-500">DTMF Input / IVR Menu</p>
</div>
</div>
</div>
</div>
{/*  Node Category  */}
<div className="mb-6">
<p className="text-[11px] font-bold text-slate-400 uppercase mb-3 px-2">Actions</p>
<div className="space-y-1">
<div className="group flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent cursor-grab transition-all">
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">
<span className="material-symbols-outlined">record_voice_over</span>
</div>
<div>
<p className="text-sm font-bold text-slate-900 dark:text-white">Welcome Message</p>
<p className="text-[11px] text-slate-500">Play audio or TTS</p>
</div>
</div>
<div className="group flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent cursor-grab transition-all">
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white">
<span className="material-symbols-outlined">schedule</span>
</div>
<div>
<p className="text-sm font-bold text-slate-900 dark:text-white">Time Routing</p>
<p className="text-[11px] text-slate-500">Schedule based path</p>
</div>
</div>
<div className="group flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent cursor-grab transition-all">
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">
<span className="material-symbols-outlined">groups</span>
</div>
<div>
<p className="text-sm font-bold text-slate-900 dark:text-white">Queue Assignment</p>
<p className="text-[11px] text-slate-500">Send to agent pool</p>
</div>
</div>
<div className="group flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent cursor-grab transition-all">
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500 text-white">
<span className="material-symbols-outlined">voicemail</span>
</div>
<div>
<p className="text-sm font-bold text-slate-900 dark:text-white">Voicemail</p>
<p className="text-[11px] text-slate-500">Record caller message</p>
</div>
</div>
</div>
</div>
</div>
<div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
<button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
<span className="material-symbols-outlined">help_outline</span>
</button>
<div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
<span>Autosaved at 14:02</span>
</div>
</div>
</aside>
{/*  Canvas Area  */}
<main className="flex-1 relative bg-slate-50 dark:bg-[#0d1117] overflow-hidden" style={{'backgroundImage':'radial-gradient(#cbd5e1 0.5px, transparent 0.5px)','backgroundSize':'24px 24px'}}>
{/*  Canvas Toolbar  */}
<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-10">
<button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
<span className="material-symbols-outlined">near_me</span>
</button>
<div className="h-6 w-px bg-slate-200 dark:border-slate-800"></div>
<button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
<span className="material-symbols-outlined">pan_tool</span>
</button>
<button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
<span className="material-symbols-outlined">add</span>
</button>
<button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
<span className="material-symbols-outlined">remove</span>
</button>
<div className="h-6 w-px bg-slate-200 dark:border-slate-800"></div>
<button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
<span className="material-symbols-outlined">center_focus_strong</span>
</button>
</div>
{/*  Nodes on Canvas  */}
<div className="absolute inset-0 p-20 pointer-events-none">
{/*  Node: Incoming Call  */}
<div className="absolute top-20 left-20 w-64 pointer-events-auto shadow-xl rounded-xl border-2 border-primary bg-white dark:bg-slate-900 overflow-hidden">
<div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-primary/20">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-xl">call_received</span>
<span className="text-sm font-bold text-slate-900 dark:text-white">Incoming Call</span>
</div>
<button className="text-slate-400 hover:text-slate-600">
<span className="material-symbols-outlined text-lg">more_horiz</span>
</button>
</div>
<div className="p-4 bg-white dark:bg-slate-900">
<div className="space-y-1">
<p className="text-[11px] font-bold text-slate-400 uppercase">Trigger</p>
<p className="text-sm font-medium text-slate-600 dark:text-slate-300">Any incoming to +1 (555) 000-1234</p>
</div>
</div>
<div className="flex items-center justify-end px-2 py-2 bg-slate-50 dark:bg-slate-800/50">
<div className="flex items-center gap-2 group cursor-pointer pr-1">
<span className="text-[10px] font-bold text-primary group-hover:mr-1 transition-all">TRIGGER</span>
<div className="h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-slate-900"></div>
</div>
</div>
</div>
{/*  SVG Connector Lines (Representation)  */}
<svg className="absolute inset-0 w-full h-full pointer-events-none">
<path d="M284 135 C 350 135, 350 135, 420 135" fill="none" stroke="#f97415" strokeDasharray="4" strokeWidth="2"></path>
<path d="M684 135 C 750 135, 750 250, 820 250" fill="none" stroke="#94a3b8" strokeWidth="2"></path>
</svg>
{/*  Node: Welcome Message  */}
<div className="absolute top-20 left-[420px] w-64 pointer-events-auto shadow-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
<div className="flex items-center justify-between px-4 py-3 bg-orange-500/10 border-b border-orange-500/20">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-orange-500 text-xl">record_voice_over</span>
<span className="text-sm font-bold text-slate-900 dark:text-white">Welcome Msg</span>
</div>
<div className="h-3 w-3 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900 absolute -left-1.5 top-1/2 -translate-y-1/2"></div>
</div>
<div className="p-4">
<div className="space-y-3">
<div>
<p className="text-[10px] font-bold text-slate-400 uppercase">Text to Speech</p>
<p className="text-sm italic text-slate-500 dark:text-slate-400">"Thank you for calling Acme Corp..."</p>
</div>
<div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
<span className="material-symbols-outlined text-sm">volume_up</span>
<span>Voice: Joanna (Neural)</span>
</div>
</div>
</div>
<div className="flex items-center justify-end px-2 py-2 bg-slate-50 dark:bg-slate-800/50">
<div className="flex items-center gap-2 group cursor-pointer pr-1">
<span className="text-[10px] font-bold text-slate-400 group-hover:text-primary transition-all uppercase">Next Action</span>
<div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-primary border-2 border-white dark:border-slate-900"></div>
</div>
</div>
</div>
{/*  Node: Menu Options  */}
<div className="absolute top-[200px] left-[820px] w-72 pointer-events-auto shadow-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
<div className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-emerald-500 text-xl">dialpad</span>
<span className="text-sm font-bold text-slate-900 dark:text-white">Main Menu</span>
</div>
<div className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -left-1.5 top-1/2 -translate-y-1/2"></div>
</div>
<div className="p-4 space-y-3">
<div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
<div className="flex items-center gap-3">
<span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-bold">1</span>
<span className="text-xs font-semibold">Sales Department</span>
</div>
<div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900 -mr-3.5"></div>
</div>
<div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
<div className="flex items-center gap-3">
<span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-bold">2</span>
<span className="text-xs font-semibold">Technical Support</span>
</div>
<div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900 -mr-3.5"></div>
</div>
<div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
<div className="flex items-center gap-3">
<span className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 dark:bg-slate-700 text-slate-600 text-[10px] font-bold">#</span>
<span className="text-xs font-semibold">Repeat Menu</span>
</div>
<div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900 -mr-3.5"></div>
</div>
</div>
<button className="w-full flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-primary hover:bg-primary/5 transition-all uppercase tracking-wider">
<span className="material-symbols-outlined text-sm">add</span>
<span>Add Option</span>
</button>
</div>
{/*  Floating Zoom Info  */}
<div className="absolute bottom-6 right-6 px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 pointer-events-auto">
                    100%
                </div>
</div>
</main>
{/*  Right Panel: Node Properties  */}
<aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col shrink-0">
<div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
<h3 className="text-sm font-bold">Node Properties</h3>
<button className="text-slate-400 hover:text-slate-600">
<span className="material-symbols-outlined text-xl">close</span>
</button>
</div>
<div className="p-5 space-y-6">
<div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
<span className="material-symbols-outlined text-2xl">call_received</span>
</div>
<div>
<p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Trigger Node</p>
<h4 className="text-lg font-bold leading-tight">Incoming Call</h4>
</div>
</div>
<div className="space-y-4">
<div className="space-y-2">
<label className="text-xs font-bold text-slate-500 uppercase">Friendly Name</label>
<input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium" type="text" value="Main Reception Trigger" />
</div>
<div className="space-y-2">
<label className="text-xs font-bold text-slate-500 uppercase">Trigger Event</label>
<select className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium appearance-none">
<option>Any Incoming Call</option>
<option>Specific Numbers</option>
<option>SIP Trunk Access</option>
</select>
</div>
<div className="space-y-2">
<label className="text-xs font-bold text-slate-500 uppercase">Assigned Numbers</label>
<div className="flex flex-wrap gap-2">
<div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/20 rounded-md">
<span className="text-[11px] font-bold text-primary">+1 (555) 000-1234</span>
<span className="material-symbols-outlined text-[12px] text-primary cursor-pointer">close</span>
</div>
<button className="flex items-center justify-center h-6 w-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined text-sm">add</span>
</button>
</div>
</div>
<div className="pt-4 space-y-3">
<div className="flex items-center justify-between">
<label className="text-xs font-bold text-slate-500 uppercase">Record Call</label>
<div className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</div>
</div>
<div className="flex items-center justify-between">
<label className="text-xs font-bold text-slate-500 uppercase">Enable Analytics</label>
<div className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</div>
</div>
</div>
</div>
<div className="pt-8 mt-auto">
<button className="w-full py-2.5 rounded-lg border-2 border-slate-100 dark:border-slate-800 font-bold text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-lg">delete_outline</span>
                        Delete Node
                    </button>
</div>
</div>
</aside>
</div>
</div>

    </>
  );
}