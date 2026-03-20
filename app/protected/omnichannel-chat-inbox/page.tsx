export default function OmnichannelChatInbox() {
  return (
    <>
      
<div className="flex h-full w-full">
{/*  Sidebar Navigation  */}

{/*  Main Content Area: Split View  */}
<div className="w-full flex-1 relative flex flex-col">
{/*  Left Pane: Conversation List  */}
<section className="w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
<div className="p-4 space-y-4">
<div className="flex items-center justify-between">
<h2 className="text-xl font-bold">Inbox</h2>
<button className="text-primary hover:bg-primary/10 p-1 rounded-full">
<span className="material-symbols-outlined">edit_square</span>
</button>
</div>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary" placeholder="Search conversations..." type="text" />
</div>
<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
<button className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium whitespace-nowrap">Mine</button>
<button className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium whitespace-nowrap">Unassigned</button>
<button className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium whitespace-nowrap">Bot-only</button>
</div>
</div>
<div className="flex-1 overflow-y-auto">
{/*  Chat Item (Active)  */}
<div className="px-4 py-3 bg-primary/5 border-l-4 border-primary cursor-pointer">
<div className="flex justify-between items-start mb-1">
<div className="flex items-center gap-2">
<div className="w-10 h-10 rounded-full bg-slate-300 shrink-0" data-alt="Customer avatar Alex" style={{}}></div>
<div>
<p className="text-sm font-semibold">Alex Johnson</p>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-green-500">shield_with_heart</span>
<span className="text-[10px] uppercase font-bold text-slate-400">WhatsApp</span>
</div>
</div>
</div>
<span className="text-[11px] text-slate-500 font-medium">2m ago</span>
</div>
<p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">I'm having trouble with my recent subscription billing...</p>
</div>
{/*  Chat Item  */}
<div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
<div className="flex justify-between items-start mb-1">
<div className="flex items-center gap-2">
<div className="w-10 h-10 rounded-full bg-slate-300 shrink-0" data-alt="Customer avatar Martha" style={{}}></div>
<div>
<p className="text-sm font-semibold">Martha Stewart</p>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-primary">language</span>
<span className="text-[10px] uppercase font-bold text-slate-400">Web Chat</span>
</div>
</div>
</div>
<span className="text-[11px] text-slate-500 font-medium">15m ago</span>
</div>
<p className="text-xs text-slate-500 line-clamp-1">Thank you for the quick resolution!</p>
</div>
{/*  Chat Item  */}
<div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
<div className="flex justify-between items-start mb-1">
<div className="flex items-center gap-2">
<div className="w-10 h-10 rounded-full bg-slate-300 shrink-0" data-alt="Customer avatar Kevin" style={{}}></div>
<div>
<p className="text-sm font-semibold">Kevin Smith</p>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-green-500">shield_with_heart</span>
<span className="text-[10px] uppercase font-bold text-slate-400">WhatsApp</span>
</div>
</div>
</div>
<span className="text-[11px] text-slate-500 font-medium">1h ago</span>
</div>
<p className="text-xs text-slate-500 line-clamp-1">Where is my order #5524?</p>
</div>
</div>
</section>
{/*  Middle Pane: Active Chat Window  */}
<section className="flex-1 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
{/*  Chat Header  */}

{/*  Chat Body  */}
<div className="flex-1 overflow-y-auto p-6 space-y-6">
{/*  Status Indicator  */}
<div className="flex justify-center">
<span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[11px] font-semibold rounded-full flex items-center gap-1.5 uppercase tracking-wider border border-amber-100 dark:border-amber-800">
<span className="material-symbols-outlined text-xs">smart_toy</span>
                        Taken over from Bot
                    </span>
</div>
{/*  Message Received  */}
<div className="flex items-end gap-3 max-w-[80%]">
<div className="w-8 h-8 rounded-full bg-slate-300 shrink-0" data-alt="Alex Johnson" style={{}}></div>
<div className="space-y-1">
<div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none">
<p className="text-sm">Hi, I'm having trouble with my recent subscription billing. It seems I was charged twice this month.</p>
</div>
<span className="text-[10px] text-slate-400 ml-1">10:42 AM</span>
</div>
</div>
{/*  Message Sent  */}
<div className="flex items-end justify-end gap-3 ml-auto max-w-[80%]">
<div className="space-y-1 text-right">
<div className="bg-primary text-white p-3 rounded-2xl rounded-br-none">
<p className="text-sm text-left">I'm sorry to hear that, Alex. Let me look into your account. Could you please confirm the last 4 digits of the card used?</p>
</div>
<div className="flex items-center justify-end gap-1">
<span className="text-[10px] text-slate-400">10:45 AM</span>
<span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
</div>
</div>
</div>
{/*  Message Received  */}
<div className="flex items-end gap-3 max-w-[80%]">
<div className="w-8 h-8 rounded-full bg-slate-300 shrink-0" data-alt="Alex Johnson" style={{}}></div>
<div className="space-y-1">
<div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none">
<p className="text-sm">Sure, it ends in 4492. I also have the invoice number if that helps: #INV-2024-009.</p>
</div>
<span className="text-[10px] text-slate-400 ml-1">10:46 AM</span>
</div>
</div>
</div>
{/*  Chat Footer: Input Area  */}

</section>
{/*  Right Pane: Customer Mini-Profile  */}
<section className="w-72 hidden xl:flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
<div className="text-center space-y-3 mb-8">
<div className="relative inline-block">
<div className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 bg-slate-200 mx-auto" data-alt="Alex Johnson large profile" style={{}}></div>
<div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900"></div>
</div>
<div>
<h4 className="text-lg font-bold">Alex Johnson</h4>
<span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full tracking-wider">Lead</span>
</div>
</div>
<div className="space-y-6">
<div className="space-y-1">
<p className="text-[10px] font-bold text-slate-400 uppercase">Contact Information</p>
<div className="space-y-3">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
<span className="text-sm truncate">alex.j@example.com</span>
</div>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-slate-400 text-lg">call</span>
<span className="text-sm">+1 (555) 012-3456</span>
</div>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
<span className="text-sm">San Francisco, CA</span>
</div>
</div>
</div>
<div className="space-y-1">
<p className="text-[10px] font-bold text-slate-400 uppercase">Recent Tickets</p>
<div className="space-y-2">
<div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
<div className="flex justify-between items-start mb-1">
<span className="text-xs font-semibold">#TCK-9902</span>
<span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Closed</span>
</div>
<p className="text-[11px] text-slate-500 line-clamp-1">Product return inquiry</p>
</div>
<div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
<div className="flex justify-between items-start mb-1">
<span className="text-xs font-semibold">#TCK-9120</span>
<span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">Open</span>
</div>
<p className="text-[11px] text-slate-500 line-clamp-1">Billing issue report</p>
</div>
</div>
</div>
<button className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                    View Full History
                </button>
</div>
</section>
</div></div></>
  );
}