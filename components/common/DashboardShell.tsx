"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const navItems = [
  { href: "/protected", icon: "dashboard", label: "Dashboard", roles: ["sales_agent", "admin", "superadmin"] },
  { href: "/protected/executive-dashboard", icon: "monitoring", label: "Executive", roles: ["admin", "superadmin"] },
  { href: "/protected/crm-leads-table", icon: "groups", label: "Leads", roles: ["sales_agent", "admin", "superadmin"] },
  { href: "/protected/task-management-board", icon: "assignment_turned_in", label: "Tasks", roles: ["sales_agent", "admin", "superadmin"] },
  { href: "/protected/omnichannel-chat-inbox", icon: "chat_bubble", label: "Chat", roles: ["sales_agent", "admin", "superadmin"] },
  { href: "/protected/tickets", icon: "support_agent", label: "Support", roles: ["sales_agent", "admin", "server_admin", "superadmin"] },
  { href: "/protected/super-admin", icon: "public", label: "Global Command", roles: ["superadmin"] },
];

const systemItems = [
  { href: "/protected/visual-bot-builder", icon: "robot_2", label: "Bot Builder", roles: ["sales_agent", "admin", "superadmin"] },
  { href: "/protected/visual-ivr-builder", icon: "account_tree", label: "IVR Builder", roles: ["sales_agent", "admin", "superadmin"], disabled: true },
  // Telephony is hidden for superadmin — they get the real route in platformItems below
  { href: "/protected/telephony-and-softphone", icon: "call", label: "Telephony", roles: ["sales_agent", "admin"], disabled: true },
];

// Superadmin-only: platform control routes
const platformItems = [
  { href: "/protected/super-admin/overview", icon: "monitoring", label: "Overview" },
  { href: "/protected/super-admin/tenants", icon: "corporate_fare", label: "Tenants" },
  { href: "/protected/super-admin/agents", icon: "manage_accounts", label: "Agent Management" },
  { href: "/protected/super-admin/users", icon: "group", label: "Users" },
  { href: "/protected/super-admin/telephony", icon: "call", label: "Telephony" },
  { href: "/protected/super-admin/permissions", icon: "shield", label: "Permissions" },
  { href: "/protected/super-admin/audit-logs", icon: "history", label: "Audit Logs" },
  { href: "/protected/super-admin/settings", icon: "settings", label: "System Settings" },
];
export default function DashboardShell({ children, role, name }: { children: ReactNode; role?: string; name?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(pathname.startsWith('/protected/super-admin'));
  const [systemOpen, setSystemOpen] = useState(false);
  const [throughputOpen, setThroughputOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/protected/super-admin')) {
      setPlatformOpen(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Filter items based on role
  const filteredNav = navItems.filter(item => item.roles?.includes(role || "sales_agent"));
  const filteredSystem = systemItems.filter(item => item.roles?.includes(role || "sales_agent"));

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">dataset</span>
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">CRM Executive</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{role} Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {filteredNav.map(({ href, icon, label }) => {
          const isPlatformTrigger = href === "/protected/super-admin";
          const isActive = isPlatformTrigger
            ? pathname.startsWith(href)
            : href === "/protected"
              ? pathname === href
              : pathname.startsWith(href);

          if (isPlatformTrigger) {
            return (
              <div key={href} className="space-y-1">
                <button
                  onClick={() => setPlatformOpen(!platformOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[22px]">{icon}</span>
                    <span>{label}</span>
                  </div>
                  <span className={`material-symbols-outlined text-[18px] transition-transform ${platformOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                {platformOpen && (
                  <div className="pl-9 space-y-1 mt-1">
                    {platformItems.map((item) => {
                      const isItemActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isItemActive
                              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5"
                              : "text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px] opacity-70">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}

        <div className="pt-4 pb-2">
          <button
            onClick={() => setSystemOpen(!systemOpen)}
            className="w-full flex items-center justify-between px-3 group"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              System
            </p>
            <span className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform ${systemOpen ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>
        </div>

        {systemOpen && filteredSystem.map(({ href, icon, label, disabled }) => {
          const isActive = pathname.startsWith(href);
          return disabled ? (
            <div
              key={href}
              onClick={() => toast("Coming soon", { icon: "⏳" })}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-900"
              title="Coming Soon"
            >
              <span className="material-symbols-outlined text-[22px] opacity-50">{icon}</span>
              <span>{label}</span>
            </div>
          ) : (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Platform Control section is now rendered inline as a dropdown inside the nav items map above */}

        {/* ── Personal Throughput (sales_agent & admin only) ── */}
        {role !== 'superadmin' && (
          <div className="pt-8 pb-4">
            <button
              onClick={() => setThroughputOpen(!throughputOpen)}
              className="w-full flex items-center justify-between px-3 mb-4 group"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                Throughput
              </p>
              <span className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform ${throughputOpen ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </button>
            {throughputOpen && (
              <div className="space-y-4 px-3">
                {role === 'admin' ? (
                  <>
                    <SidebarProgress label="Team Objectives" value={64} color="bg-indigo-500" />
                    <SidebarProgress label="SLA Compliance" value={88} color="bg-blue-500" />
                  </>
                ) : (
                  <>
                    <SidebarProgress label="Daily Outreach" value={45} color="bg-indigo-500" />
                    <SidebarProgress label="Lead Follow-up" value={72} color="bg-amber-500" />
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Sign out
        </button>

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="size-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium text-xs flex-shrink-0">
            AD
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{role || "User"}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden">
      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        {sidebarContent}
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hidden lg:flex flex-col z-20">
        {sidebarContent}
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 lg:px-6">
          <div className="flex items-center gap-3 flex-1">
            {/* Hamburger – mobile only */}
            <button
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Search across tenants, clients, or tickets..."
                className="w-full rounded-lg border-none bg-slate-100 dark:bg-slate-800 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-1">
              <button aria-label="Notifications" className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              </button>
              <button aria-label="Help" className="hidden sm:block p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
              <ThemeSwitcher />
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* Mobile-only compact quick action */}
            <button className="sm:hidden p-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.97]">
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>
        </header>

        {/* Page slot */}
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
          {children}
        </div>

        <footer className="mt-auto p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <p>© 2024 CRM Executive v2.4.0</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Status</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SidebarProgress({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2 px-1">
      <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-tight">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-slate-700 dark:text-slate-200">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 shadow-[0_0_8px_rgba(var(--tw-shadow-color),0.5)]`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

