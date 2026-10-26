"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState, useEffect, useRef } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/client";
import { getThroughputMetrics, type ThroughputMetrics } from "@/app/actions/throughput";
import { getNotifications, type SystemNotification } from "@/app/actions/notifications";
import toast from "react-hot-toast";
import { navItems, systemItems, platformItems } from "@/lib/nav";
import { features } from "@/lib/features";

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

export default function DashboardShell({ children, role, name }: { children: ReactNode; role?: string; name?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(role === 'superadmin' || pathname.startsWith('/protected/super-admin'));
  const [systemOpen, setSystemOpen] = useState(false);
  const [throughputOpen, setThroughputOpen] = useState(true);
  const [metrics, setMetrics] = useState<ThroughputMetrics | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotification = () => setNotifOpen((prev) => !prev);

  useEffect(() => {
    if (pathname.startsWith('/protected/super-admin')) {
      setPlatformOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    getThroughputMetrics().then((res) => {
      if (res.success && res.metrics) {
        setMetrics(res.metrics);
      }
    });

    // Initial check for unread notifications count
    getNotifications().then((res) => {
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setHasUnread(res.notifications.some((n) => n.unread));
      }
    });
  }, []);

  // Fetch / refresh notifications when dropdown opens
  useEffect(() => {
    if (!notifOpen) return;
    setNotifLoading(true);
    getNotifications()
      .then((res) => {
        if (res.success && res.notifications) {
          setNotifications(res.notifications);
          setHasUnread(res.notifications.some((n) => n.unread));
        }
      })
      .finally(() => setNotifLoading(false));
  }, [notifOpen]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setHasUnread(false);
  };

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Filter items based on role and feature flags
  const filteredNav = navItems.filter(item => (!item.flag || features[item.flag]) && item.roles?.includes(role || "sales_agent"));
  const filteredSystem = systemItems.filter(item => (!item.flag || features[item.flag]) && item.roles?.includes(role || "sales_agent"));
  const filteredPlatform = platformItems.filter(item => !item.flag || features[item.flag]);

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">dataset</span>
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">{name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{role?.toUpperCase()} Console</p>
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
            const isSuperadmin = role === 'superadmin';
            return (
              <div key={href} className="space-y-1">
                <button
                  onClick={() => !isSuperadmin && setPlatformOpen(!platformOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                  } ${isSuperadmin ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[22px]">{icon}</span>
                    <span>{label}</span>
                  </div>
                  {/* Only show collapse chevron for non-superadmin roles */}
                  {!isSuperadmin && (
                    <span className={`material-symbols-outlined text-[18px] transition-transform ${platformOpen ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  )}
                </button>
                {platformOpen && (
                  <div className="pl-9 space-y-1 mt-1">
                    {filteredPlatform.map((item) => {
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

        {filteredSystem.length > 0 && (
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
        )}

        

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

        {/* ── Personal & Team Throughput Performance (Real DB Metrics) ── */}
        {/* {role !== 'superadmin' && (
          <div className="pt-8 pb-4">
            <button
              onClick={() => setThroughputOpen(!throughputOpen)}
              className="w-full flex items-center justify-between px-1 mb-4 group"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                Throughput Performance
              </p>
              <span className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform ${throughputOpen ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </button>
            {throughputOpen && (
              <div className="space-y-4 px-3">
                {metrics ? (
                  <>
                    <SidebarProgress label={metrics.primaryLabel} value={metrics.primaryValue} color={metrics.primaryColor} />
                    <SidebarProgress label={metrics.secondaryLabel} value={metrics.secondaryValue} color={metrics.secondaryColor} />
                  </>
                ) : (
                  <div className="text-[11px] text-slate-400 py-1 animate-pulse">Calculating telemetry...</div>
                )}
              </div>
            )}
          </div>
        )} */}
      </nav>

      {/* Dynamic User Profile Footer */}
      {(() => {
        const userInitials = (name || role || "User")
          .trim()
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        return (
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20 tracking-wider">
                      {userInitials}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                      {name || "Authenticated User"}
                    </p>
                    <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate uppercase tracking-wider mt-0.5">
                      {role ? role.replace('_', ' ') : "User"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200 group active:scale-95 flex items-center justify-center flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-0.5">
                    logout
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
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
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-1">
              <div ref={notifRef} className="relative">
                <button
                  aria-label="Notifications"
                  onClick={handleNotification}
                  className={`p-2 rounded-lg relative transition-colors ${
                    notifOpen
                      ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {hasUnread && (
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
                        {notifications.filter((n) => n.unread).length > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            {notifications.filter((n) => n.unread).length} new
                          </span>
                        )}
                      </div>
                      {notifications.some((n) => n.unread) && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifLoading ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                          <span className="material-symbols-outlined animate-spin text-2xl text-indigo-500">progress_activity</span>
                          <span className="text-xs">Loading notifications...</span>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-10 px-4 flex flex-col items-center justify-center text-center gap-2">
                          <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-xl">notifications_off</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No notifications yet</p>
                          <p className="text-[11px] text-slate-400 max-w-[200px]">
                            You will see ticket assignments, follow-ups, and status updates here.
                          </p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                          {notifications.map((n) => (
                            <li
                              key={n.id}
                              onClick={() => {
                                if (n.link) {
                                  setNotifOpen(false);
                                  router.push(n.link);
                                }
                              }}
                              className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                                n.unread ? "bg-indigo-50/40 dark:bg-indigo-900/10" : ""
                              }`}
                            >
                              <div className={`size-8 rounded-full ${n.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                <span className={`material-symbols-outlined text-[16px] ${n.color}`}>{n.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                                  {n.unread && (
                                    <span className="size-1.5 rounded-full bg-indigo-600 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                                <span className="text-[10px] text-slate-400 block mt-1">{formatRelativeTime(n.time)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                        <Link
                          href="/protected/tickets"
                          onClick={() => setNotifOpen(false)}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          View all tickets
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
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

