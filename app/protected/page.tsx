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

      <div>
        {/* Main Chart Area */}
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
