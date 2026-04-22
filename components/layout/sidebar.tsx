"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// --- 1. DYNAMIC ACL CONFIGURATION ---
const sidebarItems = [
  // CORE NODES
  { href: "/protected", icon: "dashboard", label: "Portal Home", roles: ["sales_agent", "admin", "superadmin", "server_admin"] },
  { href: "/protected/super-admin", icon: "language", label: "Global Plane", roles: ["superadmin"] },
  { href: "/protected/executive-dashboard", icon: "monitoring", label: "Executive", roles: ["admin", "superadmin"] },
  { href: "/protected/server-admin", icon: "dns", label: "Server Node", roles: ["server_admin", "superadmin"] },
  { href: "/protected/sales-agent", icon: "badge", label: "My Workspace", roles: ["sales_agent", "admin", "superadmin"] },
  
  // OPERATIONS (Shared)
  { href: "/protected/crm-leads-table", icon: "groups", label: "CRM Leads", roles: ["sales_agent", "admin", "superadmin"] },
  { href: "/protected/task-management-board", icon: "assignment_turned_in", label: "Tasks", roles: ["sales_agent", "admin", "superadmin"] },
  { href: "/protected/omnichannel-chat-inbox", icon: "chat_bubble", label: "Chat Inbox", roles: ["sales_agent", "admin", "superadmin"] },
  { href: "/protected/tickets", icon: "support_agent", label: "Support", roles: ["sales_agent", "admin", "server_admin", "superadmin"] },
];

const systemItems = [
  { href: "/protected/visual-bot-builder", icon: "robot_2", label: "Bot Builder", roles: ["admin", "superadmin"] },
  { href: "/protected/admin-permissions-matrix", icon: "settings_accessibility", label: "Permissions", roles: ["superadmin"] },
];

export function Sidebar({ role = "sales_agent" }: { role?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const filteredNav = sidebarItems.filter(item => item.roles.includes(role));
  const filteredSystem = systemItems.filter(item => item.roles.includes(role));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col z-20 shadow-sm">
      
      {/* BRANDING */}
      <div className="p-8 flex items-center gap-3">
        <div className="size-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 animate-in zoom-in duration-500">
          <span className="material-symbols-outlined font-black">dataset</span>
        </div>
        <div>
          <h2 className="text-xl font-black leading-tight tracking-tighter uppercase text-slate-900 dark:text-white">CRM <span className="text-primary text-[10px] tracking-[0.3em]">v3</span></h2>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Intelligence Engine</p>
        </div>
      </div>
      
      {/* NAV CONTENT */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="pb-2">
           <p className="px-3 py-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-60">Authorized Protocols</p>
        </div>

        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/protected" && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? "bg-primary text-white font-bold shadow-xl shadow-primary/25 scale-[1.02]" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-[11px] uppercase font-black tracking-widest">{item.label}</span>
            </Link>
          );
        })}
        
        {filteredSystem.length > 0 && (
          <>
            <div className="pt-8 pb-2 border-t border-slate-50 dark:border-slate-800/50 mt-6">
              <p className="px-3 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-60">System Nodes</p>
            </div>
            {filteredSystem.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="text-[11px] uppercase font-black tracking-widest">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>
      
      {/* FOOTER */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shadow-inner">
            {role.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black truncate uppercase tracking-tighter text-slate-900 dark:text-white">{role.replace('_', ' ')}</p>
            <p className="text-[8px] font-bold text-emerald-500 truncate uppercase tracking-widest">Node: af-south-1</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}