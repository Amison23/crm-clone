export default function VisualBotBuilder() {
  return (
    <>
      
<div className="flex h-screen w-full flex-col">
{/*  Top Navigation Bar  */}
<header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 shrink-0">
<div className="flex items-center gap-6">
<div className="flex items-center gap-3">
<div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined !text-2xl">account_tree</span>
</div>
<div className="flex flex-col">
<h2 className="text-sm font-bold leading-none">Support Bot v2</h2>
<span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Draft Workflow</span>
</div>
</div>
<nav className="hidden md:flex items-center gap-1 ml-4">
<a className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg" href="#">Builder</a>
<a className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" href="#">Settings</a>
<a className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" href="#">Analytics</a>
</nav>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center border-r border-slate-200 dark:border-slate-800 pr-4 mr-2 gap-2">
<button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
<span className="material-symbols-outlined">undo</span>
</button>
<button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
<span className="material-symbols-outlined">redo</span>
</button>
</div>
<button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
<span className="material-symbols-outlined !text-xl">play_circle</span>
                Preview
            </button>
<button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Save
            </button>
<button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                Publish
            </button>
<div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 ml-2 overflow-hidden">
<img alt="User Profile" className="w-full h-full object-cover" data-alt="User avatar placeholder profile picture" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
</div>
</header>
<div className="flex flex-1 overflow-hidden">
{/*  Sidebar: Building Blocks  */}
<aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto">
<div className="p-6">
<h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Building Blocks</h3>
<div className="space-y-3">
{/*  Block: Trigger  */}
<div className="group cursor-grab active:cursor-grabbing p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-primary flex items-center justify-center">
<span className="material-symbols-outlined">bolt</span>
</div>
<div>
<p className="text-sm font-bold">User Message</p>
<p className="text-[11px] text-slate-500">Starting trigger</p>
</div>
</div>
</div>
{/*  Block: Bot Reply  */}
<div className="group cursor-grab active:cursor-grabbing p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-primary flex items-center justify-center">
<span className="material-symbols-outlined">chat_bubble</span>
</div>
<div>
<p className="text-sm font-bold">Bot Reply</p>
<p className="text-[11px] text-slate-500">Send message</p>
</div>
</div>
</div>
{/*  Block: Logic  */}
<div className="group cursor-grab active:cursor-grabbing p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
<span className="material-symbols-outlined">call_split</span>
</div>
<div>
<p className="text-sm font-bold">Condition (If/Then)</p>
<p className="text-[11px] text-slate-500">Branch your flow</p>
</div>
</div>
</div>
{/*  Block: Lead Info  */}
<div className="group cursor-grab active:cursor-grabbing p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
<span className="material-symbols-outlined">contact_page</span>
</div>
<div>
<p className="text-sm font-bold">Collect Lead Info</p>
<p className="text-[11px] text-slate-500">Capture data</p>
</div>
</div>
</div>
{/*  Block: Handoff  */}
<div className="group cursor-grab active:cursor-grabbing p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center">
<span className="material-symbols-outlined">support_agent</span>
</div>
<div>
<p className="text-sm font-bold">Agent Handoff</p>
<p className="text-[11px] text-slate-500">Talk to human</p>
</div>
</div>
</div>
</div>
<div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
<h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Integrations</h3>
<div className="flex gap-2">
<div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
<img alt="Slack" className="w-5 h-5 grayscale" data-alt="Slack logo grayscale" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
<div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
<img alt="Hubspot" className="w-5 h-5 grayscale" data-alt="Hubspot logo grayscale" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
<div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
<img alt="Mailchimp" className="w-5 h-5 grayscale" data-alt="Mailchimp logo grayscale" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
</div>
</div>
</div>
</aside>
{/*  Main Canvas Area  */}
<main className="flex-1 relative bg-slate-50 dark:bg-slate-950 canvas-grid overflow-hidden">
{/*  Canvas Toolbar (Zoom/Controls)  */}
<div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 flex items-center gap-4 shadow-xl z-10">
<button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined">zoom_in</span></button>
<span className="text-xs font-bold text-slate-500">100%</span>
<button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined">zoom_out</span></button>
<div className="w-[1px] h-4 bg-slate-200 dark:border-slate-800"></div>
<button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined">filter_center_focus</span></button>
<button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined">open_with</span></button>
</div>
{/*  Canvas Nodes Example  */}
<div className="p-20 flex flex-col items-center min-w-[1200px]">
{/*  Node 1: Trigger  */}
<div className="relative mb-16">
<div className="w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border-2 border-primary overflow-hidden">
<div className="bg-primary/10 p-3 flex items-center gap-2 border-b border-primary/20">
<span className="material-symbols-outlined text-primary text-sm">bolt</span>
<span className="text-xs font-bold uppercase text-primary">Trigger</span>
</div>
<div className="p-4">
<p className="text-sm font-medium text-slate-900 dark:text-slate-100">When user says "Hi" or "Help"</p>
</div>
</div>
<div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[2px] h-16 bg-slate-300 dark:bg-slate-700"></div>
</div>
{/*  Node 2: Bot Reply  */}
<div className="relative mb-16">
<div className="w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
<div className="bg-primary/10 p-3 flex items-center gap-2 border-b border-primary/20">
<span className="material-symbols-outlined text-primary text-sm">chat_bubble</span>
<span className="text-xs font-bold uppercase text-primary">Bot Reply</span>
</div>
<div className="p-4 space-y-2">
<p className="text-sm">"Hello! How can I assist you today?"</p>
<div className="flex flex-wrap gap-1 mt-3">
<span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] rounded border border-slate-200 dark:border-slate-700">Quick Reply</span>
</div>
</div>
</div>
<div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[2px] h-16 bg-slate-300 dark:bg-slate-700"></div>
</div>
{/*  Split Layout: Condition  */}
<div className="relative flex gap-32">
{/*  Connector Lines for Branching  */}
<svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%+8rem)] h-16 pointer-events-none overflow-visible" fill="none">
<path className="text-slate-300 dark:text-slate-700" d="M 50% 0 L 50% 32 L 0% 32 L 0% 64" stroke="currentColor" strokeWidth="2"></path>
<path className="text-slate-300 dark:text-slate-700" d="M 50% 32 L 100% 32 L 100% 64" stroke="currentColor" strokeWidth="2"></path>
</svg>
{/*  Left Branch  */}
<div className="flex flex-col items-center">
<div className="w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
<div className="bg-purple-400/10 p-3 flex items-center gap-2 border-b border-purple-100 dark:border-purple-900/30">
<span className="material-symbols-outlined text-purple-600 text-sm">call_split</span>
<span className="text-xs font-bold uppercase text-purple-700 dark:text-purple-400">Condition</span>
</div>
<div className="p-4">
<p className="text-sm font-medium">Is existing customer?</p>
<div className="mt-3 space-y-2">
<div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase">
<span>Yes</span>
<span className="material-symbols-outlined !text-xs">chevron_right</span>
</div>
<div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase">
<span>No</span>
<span className="material-symbols-outlined !text-xs">chevron_right</span>
</div>
</div>
</div>
</div>
</div>
{/*  Right Branch  */}
<div className="flex flex-col items-center">
<div className="w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden opacity-80">
<div className="bg-emerald-400/10 p-3 flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-900/30">
<span className="material-symbols-outlined text-emerald-600 text-sm">contact_page</span>
<span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">Collect Lead</span>
</div>
<div className="p-4">
<p className="text-sm">Capture email and company name</p>
</div>
</div>
</div>
</div>
</div>
</main>
{/*  Node Configuration Panel  */}
<aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto">
<div className="p-6 border-b border-slate-200 dark:border-slate-800">
<div className="flex items-center justify-between mb-2">
<h3 className="text-sm font-bold">Bot Reply Settings</h3>
<button className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined !text-xl">close</span></button>
</div>
<p className="text-xs text-slate-500">Configure what the bot says to the user</p>
</div>
<div className="p-6 space-y-6">
<div>
<label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message Text</label>
<textarea className="w-full h-32 text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-primary focus:border-primary p-3" placeholder="Type message here...">Hello! How can I assist you today?</textarea>
<div className="flex gap-2 mt-2">
<button className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary"><span className="material-symbols-outlined !text-lg">alternate_email</span></button>
<button className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary"><span className="material-symbols-outlined !text-lg">add_reaction</span></button>
</div>
</div>
<div>
<label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Replies</label>
<div className="space-y-2">
<div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2">
<span className="material-symbols-outlined !text-sm text-slate-400">drag_indicator</span>
<span className="text-sm flex-1">Pricing</span>
<button className="text-slate-400"><span className="material-symbols-outlined !text-sm">delete</span></button>
</div>
<div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2">
<span className="material-symbols-outlined !text-sm text-slate-400">drag_indicator</span>
<span className="text-sm flex-1">Technical Support</span>
<button className="text-slate-400"><span className="material-symbols-outlined !text-sm">delete</span></button>
</div>
<button className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
<span className="material-symbols-outlined !text-sm">add</span>
                            Add Option
                        </button>
</div>
</div>
<div className="pt-4 border-t border-slate-200 dark:border-slate-800">
<div className="flex items-center justify-between">
<span className="text-sm font-medium">Wait for user input</span>
<div className="relative inline-flex h-5 w-9 items-center rounded-full bg-primary">
<span className="inline-block h-3.5 w-3.5 translate-x-4 rounded-full bg-white transition"></span>
</div>
</div>
</div>
</div>
<div className="mt-auto p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
<button className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Apply Changes</button>
</div>
</aside>
</div>
</div>

    </>
  );
}