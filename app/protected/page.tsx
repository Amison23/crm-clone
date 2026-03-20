import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Users, 
  MessageSquare, 
  Headset, 
  BarChart3, 
  Settings,
  Bot,
  Network,
  ArrowRight,
  Target,
  TrendingUp,
  Activity
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";

async function DashboardContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/sign-in");
  }

  const quickLinks = [
    { name: "Executive Dashboard", href: "/protected/executive-dashboard", icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
    { name: "CRM Leads", href: "/protected/crm-leads-table", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Chat Inbox", href: "/protected/omnichannel-chat-inbox", icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { name: "Support Tickets", href: "/protected/support-tickets-list", icon: Headset, color: "text-rose-500", bg: "bg-rose-500/10" },
    { name: "Task Management", href: "/protected/task-management-board", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Analytics", href: "/protected/analytics-and-reporting", icon: BarChart3, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Visual Bot Builder", href: "/protected/visual-bot-builder", icon: Bot, color: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "IVR Builder", href: "/protected/visual-ivr-builder", icon: Network, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { name: "Admin Setup", href: "/protected/admin-permissions-matrix", icon: Settings, color: "text-slate-500", bg: "bg-slate-500/10" },
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome back, {data.user.email?.split('@')[0] || 'Executive'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Here's an overview of your CRM operations today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,840</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500"/>
              <span className="text-emerald-500 font-medium">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <Headset className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">158</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-rose-500"/>
              <span className="text-rose-500 font-medium">+5.4%</span> since yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Chat Volume</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,231</div>
            <p className="text-xs text-muted-foreground mt-1 text-slate-500">
              Across 5 active channels
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Bot Resolution Rate</CardTitle>
            <Bot className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76.4%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500"/>
              <span className="text-emerald-500 font-medium">+2.1%</span> from base model
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="shadow-sm h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Multi-channel interactions over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4 px-2">
              <DashboardCharts />
            </CardContent>
          </Card>
        </div>

        {/* Quick Links / Navigation */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className="group flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                    <div className={`p-2 rounded-md ${link.bg} ${link.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 font-medium text-sm text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                      {link.name}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<div className="flex-1 p-10 flex items-center justify-center text-slate-500">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
