"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// --- NAVIGATION CONFIGURATION ---
// Merged logic: Priority given to v3.0 Sections (5.1, 5.2)
const mainNavItems = [
  { href: "/protected", icon: "dashboard", label: "Portal Home" },
  { href: "/protected/executive-dashboard", icon: "monitoring", label: "Executive" }, // Section 5.1
  { href: "/protected/sales-agent", icon: "badge", label: "My Workspace" },         // Section 5.2
  { href: "/protected/crm-leads-table", icon: "groups", label: "CRM Leads" },
  { href: "/protected/task-management-board", icon: "assignment_turned_in", label: "Tasks" },
  { href: "/protected/omnichannel-chat-inbox", icon: "chat_bubble", label: "Chat Inbox" },
  { href: "/protected/support-tickets-list", icon: "support_agent", label: "Support" },
  { href: "/protected/analytics-and-reporting", icon: "insights", label: "Analytics" },
];

// Merged logic: Infrastructure & Advanced Tools (Section 5.3)
const systemNavItems = [
  { href: "/protected/server-admin", icon: "dns", label: "Server Node" },           // Section 5.3
  { href: "/protected/admin-permissions-matrix", icon: "settings_accessibility", label: "Permissions" },
  { href: "/protected/visual-bot-builder", icon: "robot_2", label: "Bot Builder" },
  { href: "/protected/visual-ivr-builder", icon: "account_tree", label: "IVR Builder" },
  { href: "/protected/telephony-and-softphone", icon: "call", label: "Telephony" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col z-20">
      
      {/* BRANDING NODE */}
      <div className="p-8 flex items-center gap-3">
        <div className="size-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined font-black">dataset</span>
        </div>
        <div>
          <h2 className="text-xl font-black leading-tight tracking-tighter uppercase">CRM <span className="text-primary text-[10px] tracking-widest">v3</span></h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Intelligence Engine</p>
        </div>
      </div>
      
      {/* NAVIGATION SCROLL AREA */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-10">
        
        {/* MAIN OPERATIONS */}
        <div className="pb-2">
           <p className="px-3 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Core Operations</p>
        </div>

        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                isActive 
                  ? "bg-primary text-white font-bold shadow-lg shadow-primary/25 scale-[1.02]" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}`}>
                {item.icon}
              </span>
              <span className="text-xs uppercase font-black tracking-tight">{item.label}</span>
            </Link>
          );
        })}
        
        {/* SYSTEM & INFRASTRUCTURE */}
        <div className="pt-8 pb-2 border-t border-slate-50 dark:border-slate-800/50 mt-6">
          <p className="px-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">System Nodes</p>
        </div>
        
        {systemNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                isActive 
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-md" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? "" : "group-hover:scale-110 transition-transform"}`}>
                {item.icon}
              </span>
              <span className="text-xs uppercase font-black tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* USER CONTEXT FOOTER */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <img 
            src="https://ui-avatars.com/api/?name=Admin+Node&background=3b82f6&color=fff" 
            alt="User avatar" 
            className="size-9 rounded-xl shadow-inner" 
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black truncate uppercase tracking-tighter">Verified Node</p>
            <p className="text-[9px] font-bold text-slate-500 truncate uppercase tracking-widest">af-south-1</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Logout"
          >
            <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-red-500 transition-colors">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}