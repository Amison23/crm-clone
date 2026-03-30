import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { 
  Card, 
  CardContent, 
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
  Activity,
  ShieldCheck,
  Zap
} from "lucide-react";

// Import your Intelligence Engine
import SummaryCards from "@/app/ui/dashboard/analytics/components/SummaryCards";

async function DashboardContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // 1. EXTRACT ROLE & IDENTITY (Standardized to employees table)
  const { data: profile } = await supabase
    .from("employees")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role || 'sales_agent';
  const fullName = profile?.full_name || user.email?.split('@')[0];

  // 2. DEFINE DYNAMIC QUICK LINKS (Role-Aware)
  const allLinks = [
    { name: "Executive Dashboard", href: "/protected/executive-dashboard", icon: BarChart3, color: "text-primary", bg: "bg-primary/10", roles: ['admin', 'superadmin'] },
    { name: "CRM Leads", href: "/protected/crm-leads-table", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", roles: ['sales_agent', 'admin', 'superadmin'] },
    { name: "Support Tickets", href: "/protected/support-tickets-list", icon: Headset, color: "text-rose-500", bg: "bg-rose-500/10", roles: ['sales_agent', 'admin', 'superadmin'] },
    { name: "Analytics Engine", href: "/protected/analytics-and-reporting", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", roles: ['admin', 'superadmin'] },
    { name: "Task Management", href: "/protected/task-management-board", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10", roles: ['sales_agent', 'admin', 'superadmin'] },
    { name: "System Command", href: "/protected/super-admin", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10", roles: ['superadmin'] },
    { name: "Bot Builder", href: "/protected/visual-bot-builder", icon: Bot, color: "text-indigo-500", bg: "bg-indigo-500/10", roles: ['admin', 'superadmin'] },
    { name: "Admin Matrix", href: "/protected/super-admin/permissions", icon: Settings, color: "text-slate-500", bg: "bg-slate-500/10", roles: ['superadmin'] },
  ];

  const quickLinks = allLinks.filter(link => link.roles.includes(role));

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6 lg:p-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* --- PORTAL HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.3em]">Node Connection Active</p>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase">
            {fullName}<span className="text-primary">'s</span> Command
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">
            Centralized access for <span className="font-bold text-slate-700 dark:text-slate-200">{role.replace('_', ' ')}</span> protocol.
          </p>
        </div>
      </div>

      {/* --- SECTION 5.3: LIVE INTELLIGENCE VITALS --- */}
      {/* We replace the 4 static cards with your real Intelligence SummaryCards component */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Real-Time Platform Pulse</h2>
        <SummaryCards />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* --- DYNAMIC MODULE ACCESS --- */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-xl font-black tracking-tight uppercase">Module Directory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className="group flex items-center gap-4 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer">
                    <div className={`p-3 rounded-2xl ${link.bg} ${link.color} group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 font-black text-sm uppercase tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                      {link.name}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* --- SYSTEM LOGS / ACTIVITY PREVIEW --- */}
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight uppercase">Node Status</h2>
          <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
             <div className="bg-[#0a0a0a] p-8 font-mono text-[10px] space-y-3 text-slate-400">
                <p className="text-emerald-500 font-bold tracking-widest border-b border-white/5 pb-2 uppercase">// System_Audit_Trail</p>
                <p><span className="text-slate-600">[08:42]</span> <span className="text-blue-500">INFO</span>: Session authorized for {user.email?.slice(0, 5)}...</p>
                <p><span className="text-slate-600">[09:15]</span> <span className="text-emerald-500">AUTH</span>: RLS Token validated.</p>
                <p><span className="text-slate-600">[10:02]</span> <span className="text-amber-500">SYNC</span>: Analytics buffer refreshed.</p>
                <div className="flex items-center gap-2 pt-4">
                   <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                   <p className="italic text-[9px] text-emerald-500/50">Listening for node events...</p>
                </div>
             </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<div className="flex-1 p-10 flex items-center justify-center text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse">Initializing Portal...</div>}>
      <DashboardContent />
    </Suspense>
  );
}