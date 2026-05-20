"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart4, 
  Building2, 
  ShieldCheck, 
  Users, 
  Settings, 
  History, 
  LayoutDashboard,
  ShieldAlert,
  Smartphone,
  User,
  Glasses
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {name: "Home", href: "/protected/super-admin", icon: LayoutDashboard},
  { name: "Overview", href: "/protected/super-admin/overview", icon: Glasses },
  { name: "Tenants", href: "/protected/super-admin/tenants", icon: Building2 },
  { name: "Agent Management", href: "/protected/super-admin/agents", icon: User },
  { name: "Users", href: "/protected/super-admin/users", icon: Users },
  { name: "Telephony", href: "/protected/super-admin/telephony", icon: Smartphone },
  { name: "Permissions", href: "/protected/super-admin/permissions", icon: ShieldCheck },
  { name: "Audit Logs", href: "/protected/super-admin/audit-logs", icon: History },
  { name: "System Settings", href: "/protected/super-admin/settings", icon: Settings },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-orange-500 p-2 rounded-lg text-white">
          <ShieldAlert className="size-5" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SuperAdmin</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Platform Control
        </p>
        
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
                isActive 
                  ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className={cn(
                "size-5",
                isActive ? "text-orange-600 dark:text-orange-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
              )} 
              />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
             SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">Admin Console</p>
            <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-tighter">System Intelligence</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
