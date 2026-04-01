"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const mainNavItems = [
  { href: "/protected", icon: "dashboard", label: "Dashboard" },
  { href: "/protected/executive-dashboard", icon: "monitoring", label: "Executive" },
  { href: "/protected/crm-leads-table", icon: "groups", label: "Leads" },
  { href: "/protected/task-management-board", icon: "assignment_turned_in", label: "Tasks" },
  { href: "/protected/omnichannel-chat-inbox", icon: "chat_bubble", label: "Chat" },
  { href: "/protected/tickets", icon: "support_agent", label: "Support" },
  { href: "/protected/analytics-and-reporting", icon: "insights", label: "Analytics" },
  { href: "/protected/admin", icon: "admin_panel_settings", label: "Admin" },
];

const systemNavItems = [
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
      <div className="p-6 flex items-center gap-3">
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">dataset</span>
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">CRM</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Admin Console</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
        
        <div className="pt-4 pb-2">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">System</p>
        </div>
{/*         
        {systemNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })} */}
      </nav>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <img src="https://ui-avatars.com/api/?name=Alex+Director&background=f97415&color=fff" alt="User avatar" className="size-8 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Alex Director</p>
            <p className="text-[10px] text-slate-500 truncate">Global Admin</p>
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
