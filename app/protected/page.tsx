import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  Users,
  BarChart3,
  Settings,
  Bot,
  ChevronRight,
  Target,
  ShieldCheck,
  Globe,
  Activity,
  Headset,
  LayoutDashboard,
  Cpu,
  MessageSquare,
} from "lucide-react";

import SummaryCards from "@/app/ui/dashboard/analytics/components/SummaryCards";

async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("employees")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role =
    profile?.role || user.user_metadata?.role || "sales_agent";
  const fullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Operator";

  const firstName = fullName.split(" ")[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const roleLabel = role.replace(/_/g, " ");

  // Module access matrix
  const allLinks = [
    {
      name: "Global command",
      href: "/protected/super-admin",
      icon: Globe,
      bg: "bg-purple-100 dark:bg-purple-900/40",
      iconColor: "text-purple-600 dark:text-purple-400",
      roles: ["superadmin"],
      desc: "Platform-wide management",
    },
    {
      name: "Executive console",
      href: "/protected/executive-dashboard",
      icon: BarChart3,
      bg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-600 dark:text-blue-400",
      roles: ["admin", "superadmin"],
      desc: "Revenue & yield analytics",
    },
    {
      name: "My workspace",
      href: "/protected/sales-agent",
      icon: LayoutDashboard,
      bg: "bg-green-100 dark:bg-green-900/40",
      iconColor: "text-green-600 dark:text-green-400",
      roles: ["sales_agent", "admin", "superadmin"],
      desc: "Tasks & pipeline queue",
    },
    {
      name: "CRM leads",
      href: "/protected/crm-leads-table",
      icon: Users,
      bg: "bg-sky-100 dark:bg-sky-900/40",
      iconColor: "text-sky-600 dark:text-sky-400",
      roles: ["sales_agent", "admin", "superadmin"],
      desc: "Lead acquisition database",
    },
    {
      name: "Inbox",
      href: "/protected/omnichannel-chat-inbox",
      icon: MessageSquare,
      bg: "bg-teal-100 dark:bg-teal-900/40",
      iconColor: "text-teal-600 dark:text-teal-400",
      roles: ["sales_agent", "admin", "superadmin"],
      desc: "Live customer communication",
    },
    {
      name: "Tasks",
      href: "/protected/task-management-board",
      icon: Target,
      bg: "bg-orange-100 dark:bg-orange-900/40",
      iconColor: "text-orange-600 dark:text-orange-400",
      roles: ["sales_agent", "admin", "superadmin"],
      desc: "SLA objective board",
    },
    {
      name: "Support tickets",
      href: "/protected/tickets",
      icon: Headset,
      bg: "bg-red-100 dark:bg-red-900/40",
      iconColor: "text-red-600 dark:text-red-400",
      roles: ["sales_agent", "admin", "server_admin", "superadmin"],
      desc: "Incident resolution queue",
    },
    {
      name: "Bot builder",
      href: "/protected/visual-bot-builder",
      icon: Bot,
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      roles: ["admin", "superadmin"],
      desc: "AI routing & automation",
    },
    {
      name: "Infrastructure",
      href: "/protected/server-admin",
      icon: Cpu,
      bg: "bg-amber-100 dark:bg-amber-900/40",
      iconColor: "text-amber-600 dark:text-amber-400",
      roles: ["server_admin", "superadmin"],
      desc: "Node health & server logs",
    },
    {
      name: "Admin matrix",
      href: "/protected/admin-permissions-matrix",
      icon: Settings,
      bg: "bg-slate-100 dark:bg-slate-800",
      iconColor: "text-slate-600 dark:text-slate-400",
      roles: ["superadmin"],
      desc: "Global ACL & role provisioning",
    },
  ];

  const quickLinks = allLinks.filter((link) => link.roles.includes(role));

  return (
    <div className="flex-1 w-full px-10 py-10 space-y-10 animate-in fade-in duration-700">

      {/* ── HEADER ── */}
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-widest uppercase text-slate-400 dark:text-slate-500">
          {today}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {greeting}, {firstName}.
        </h1>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">
            {roleLabel} · Active
          </span>
        </div>
      </header>

      {/* ── STATS ROW ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open leads", value: "—", sub: null },
          { label: "Tasks due today", value: "—", sub: null },
          { label: "Open tickets", value: "—", sub: null },
          { label: "Unread messages", value: "—", sub: null },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 space-y-1"
          >
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-slate-800 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* ── MAIN LAYOUT ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── MODULE GRID ── */}
        <section className="xl:col-span-2 space-y-4">
          <p className="text-xs font-medium tracking-widest uppercase text-slate-400 dark:text-slate-500">
            Quick access
          </p>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${link.bg}`}
                    >
                      <Icon className={`w-5 h-5 ${link.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">
                        {link.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {link.desc}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 transition-colors shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── SESSION SIDEBAR ── */}
        <section className="space-y-4">
          <p className="text-xs font-medium tracking-widest uppercase text-slate-400 dark:text-slate-500">
            Session
          </p>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {[
              { key: "User ID", value: user.id.slice(0, 8) },
              { key: "Role", value: roleLabel },
              { key: "Access", value: "Verified", green: true },
              { key: "Region", value: "af-south-1" },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <span className="text-sm text-slate-400 dark:text-slate-500">
                  {row.key}
                </span>
                <span
                  className={`text-sm font-medium capitalize ${
                    row.green
                      ? "text-green-500"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2.5 px-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Connected · af-south-1
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardContent />
    </Suspense>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 border-2 border-slate-200 dark:border-slate-700 border-t-slate-500 dark:border-t-slate-300 rounded-full animate-spin" />
      <p className="text-xs text-slate-400 dark:text-slate-500 tracking-widest uppercase">
        Loading
      </p>
    </div>
  );
}