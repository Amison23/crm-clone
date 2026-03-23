import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Smile,
  Search,
  Edit,
  ShieldCheck,
  Globe,
  MoreHorizontal,
  CheckCheck
} from "lucide-react";

export default function OmnichannelChatInbox() {
  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* Left Pane: Conversation List */}
      <section className="w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Inbox</h2>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Edit className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
              placeholder="Search conversations..." 
              type="text" 
            />
          </div>
          <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
            <Button size="sm" className="rounded-full h-8 px-4 text-xs">Mine</Button>
            <Button variant="secondary" size="sm" className="rounded-full h-8 px-4 text-xs">Unassigned</Button>
            <Button variant="secondary" size="sm" className="rounded-full h-8 px-4 text-xs">Bot-only</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Active Chat Item */}
          <div className="px-4 py-4 bg-primary/5 border-l-4 border-primary cursor-pointer transition-colors">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center font-bold text-slate-600">AJ</div>
                <div>
                  <p className="text-sm font-semibold">Alex Johnson</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WhatsApp</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">2m ago</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-1 pl-13 pl-[52px]">I'm having trouble with my recent subscription billing...</p>
          </div>

          {[
            { name: "Martha Stewart", initial: "MS", source: "Web Chat", icon: Globe, time: "15m ago", msg: "Thank you for the quick resolution!", color: "text-blue-500" },
            { name: "Kevin Smith", initial: "KS", source: "WhatsApp", icon: ShieldCheck, time: "1h ago", msg: "Where is my order #5524?", color: "text-emerald-500" },
          ].map((chat, i) => (
            <div key={i} className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center font-bold text-slate-500">{chat.initial}</div>
                  <div>
                    <p className="text-sm font-semibold">{chat.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <chat.icon className={`w-3.5 h-3.5 ${chat.color}`} />
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{chat.source}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">{chat.time}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-1 pl-[52px]">{chat.msg}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Middle Pane: Active Chat Window */}
      <section className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        {/* Chat Header */}
        <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm">AJ</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Alex Johnson</h3>
                <span className="size-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Local time: 10:48 AM (PST)</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary rounded-full">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary rounded-full">
              <Video className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
              Resolve
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 rounded-full">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full flex items-center gap-2 uppercase tracking-widest border border-amber-200/50 dark:border-amber-800/50 shadow-sm">
              <MoreHorizontal className="w-3 h-3 animate-pulse" />
              Taken over from Bot
            </span>
          </div>

          {/* Message Received */}
          <div className="flex items-end gap-3 max-w-[85%] group">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:scale-110 transition-transform">AJ</div>
            <div className="space-y-1">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">Hi, I'm having trouble with my recent subscription billing. It seems I was charged twice this month.</p>
              </div>
              <span className="text-[10px] text-slate-400 ml-1 font-medium">10:42 AM</span>
            </div>
          </div>

          {/* Message Sent */}
          <div className="flex items-end justify-end gap-3 ml-auto max-w-[85%]">
            <div className="space-y-1 text-right">
              <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-br-none shadow-lg shadow-primary/10">
                <p className="text-sm leading-relaxed">I'm sorry to hear that, Alex. Let me look into your account. Could you please confirm the last 4 digits of the card used?</p>
              </div>
              <div className="flex items-center justify-end gap-1.5 pr-1">
                <span className="text-[10px] text-slate-400 font-medium">10:45 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </div>

          {/* Message Received */}
          <div className="flex items-end gap-3 max-w-[85%] group">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:scale-110 transition-transform">AJ</div>
            <div className="space-y-1">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">Sure, it ends in 4492. I also have the invoice number if that helps: #INV-2024-009.</p>
              </div>
              <span className="text-[10px] text-slate-400 ml-1 font-medium">10:46 AM</span>
            </div>
          </div>
        </div>

        {/* Chat Footer: Input Area */}
        <footer className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white dark:focus-within:bg-slate-900">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary shrink-0 rounded-lg">
                <Paperclip className="w-5 h-5" />
              </Button>
              <textarea 
                rows={1}
                placeholder="Type your message..." 
                className="flex-1 bg-transparent border-none outline-none resize-none px-2 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 min-h-[40px] max-h-32" 
              />
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary shrink-0 rounded-lg">
                <Smile className="w-5 h-5" />
              </Button>
              <Button size="icon" className="shrink-0 rounded-lg shadow-lg shadow-primary/20 h-9 w-9">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between px-1">
              <div className="flex gap-4">
                <button className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-wider transition-colors">Internal Note</button>
                <button className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-wider transition-colors">Canned Responses</button>
              </div>
              <p className="text-[10px] text-slate-400 italic">Press Enter to send, Shift + Enter for new line</p>
            </div>
          </div>
        </footer>
      </section>

      {/* Right Pane: Customer Mini-Profile */}
      <section className="w-72 hidden xl:flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
        <div className="text-center space-y-3 mb-8">
          <div className="relative inline-block group">
            <div className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 bg-slate-100 flex items-center justify-center font-bold text-2xl text-slate-400 group-hover:scale-105 transition-transform duration-500">AJ</div>
            <div className="absolute bottom-1 right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
          </div>
          <div>
            <h4 className="text-lg font-bold">Alex Johnson</h4>
            <div className="flex justify-center mt-1">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full tracking-wider border border-primary/20">Lead</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contact Information</p>
            <div className="space-y-3">
              {[
                { icon: "mail", val: "alex.j@example.com" },
                { icon: "call", val: "+1 (555) 012-3456" },
                { icon: "location_on", val: "San Francisco, CA" },
              ].map((info, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-slate-400 text-lg">{info.icon}</span>
                  <span className="text-sm truncate font-medium">{info.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Recent Tickets</p>
            <div className="space-y-2">
              {[
                { id: "#TCK-9902", status: "Closed", sCol: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", title: "Product return inquiry" },
                { id: "#TCK-9120", status: "Open", sCol: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", title: "Billing issue report" },
              ].map((tck, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{tck.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tck.sCol}`}>{tck.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{tck.title}</p>
                </div>
              ))}
            </div>
          </div>

          <Button variant="secondary" className="w-full text-xs font-bold uppercase tracking-wider h-10 shadow-sm">
            View Full History
          </Button>
        </div>
      </section>
    </div>
  );
}