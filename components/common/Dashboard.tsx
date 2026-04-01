"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";

const navItems = [
  { href: "/protected", icon: "dashboard", label: "Dashboard" },
  { href: "/protected/executive-dashboard", icon: "monitoring", label: "Executive" },
  { href: "/protected/crm-leads-table", icon: "groups", label: "Leads" },
  { href: "/protected/task-management-board", icon: "assignment_turned_in", label: "Tasks" },
  { href: "/protected/omnichannel-chat-inbox", icon: "chat_bubble", label: "Chat" },
  { href: "/protected/tickets", icon: "support_agent", label: "Support" },
  { href: "/protected/analytics-and-reporting", icon: "insights", label: "Analytics" },
  { href: "/protected/admin", icon: "admin_panel_settings", label: "Admin" },
];

const systemItems = [
  { href: "/protected/visual-bot-builder", icon: "robot_2", label: "Bot Builder" },
  { href: "/protected/visual-ivr-builder", icon: "account_tree", label: "IVR Builder" },
  { href: "/protected/telephony-and-softphone", icon: "call", label: "Telephony" },
];

export default function Dashboard({ children, role }: { children: ReactNode; role?: string }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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
          <p className="text-xs text-slate-500 dark:text-slate-400">Admin Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ href, icon, label }) => {
          const isActive = href === "/protected"
            ? pathname === href
            : pathname.startsWith(href);
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
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            System
          </p>
        </div>

        {systemItems.map(({ href, icon, label }) => {
          const isActive = pathname.startsWith(href);
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
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div className="size-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Alex Director</p>
            <p className="text-[10px] text-slate-500 truncate">{role || "User"}</p>
          </div>
          <button aria-label="Sign out" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
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

