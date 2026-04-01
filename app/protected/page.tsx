import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { 
  Users, 
  BarChart3, 
  Settings,
  Bot,
  ArrowRight,
  Target,
  ShieldCheck,
  Zap,
  Globe,
  Terminal,
  Activity
} from "lucide-react";

// Intelligence Engine
import SummaryCards from "@/app/ui/dashboard/analytics/components/SummaryCards";

async function DashboardContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. IDENTITY & ROLE (DB Check: 'superadmin')
  const role = user.user_metadata?.role || 'sales_agent';
  const fullName = user.user_metadata?.full_name || "Operator";

  /**
   * 2. DYNAMIC MODULE ACCESS
   * VERIFY: Ensure these folders exist in your /protected/ directory
   */
  const allLinks = [
    { name: "Super Admin Command", href: "/protected/super-admin", icon: Globe, color: "text-purple-500", bg: "bg-purple-500/10", roles: ['superadmin'] },
    { name: "Executive Dashboard", href: "/protected/executive-dashboard", icon: BarChart3, color: "text-primary", bg: "bg-primary/10", roles: ['admin', 'superadmin'] },
    { name: "Analytics Node", href: "/protected/analytics-and-reporting", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", roles: ['admin', 'superadmin'] },
    { name: "CRM Leads", href: "/protected/crm-leads-table", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", roles: ['sales_agent', 'admin', 'superadmin'] },
    { name: "Task Management", href: "/protected/task-management-board", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10", roles: ['sales_agent', 'admin', 'superadmin'] },
    { name: "Bot Builder", href: "/protected/visual-bot-builder", icon: Bot, color: "text-indigo-500", bg: "bg-indigo-500/10", roles: ['admin', 'superadmin'] },
    { name: "Admin Matrix", href: "/protected/admin-permissions-matrix", icon: Settings, color: "text-slate-500", bg: "bg-slate-500/10", roles: ['superadmin'] },
  ];

  const quickLinks = allLinks.filter(link => link.roles.includes(role));

  return (
    <div className="flex-1 w-full flex flex-col gap-10 p-6 lg:p-12 max-w-7xl mx-auto animate-in fade-in duration-1000">
      
      {/* --- PORTAL HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             <p className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.4em]">Secure Node Connection: af-south-1</p>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase leading-none">
            {fullName}<span className="text-primary">'s</span> Portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic text-lg">
            Authorized as <span className="font-bold text-slate-700 dark:text-slate-200 uppercase not-italic">{role}</span>.
          </p>
        </div>
        
        {/* REFRESH/SYNC ACTION */}
        <div className="flex items-center gap-3">
           <button
             className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700"
             aria-label="Refresh or Sync"
             title="Refresh or Sync"
           >
              <Activity size={20} />
           </button>
        </div>
      </header>

      {/* --- LIVE INTELLIGENCE VITALS --- */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Real-Time Platform Pulse</h2>
          <Link href="/protected/analytics-and-reporting" className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
             Full Intelligence Node <ArrowRight size={12} />
          </Link>
        </div>
        
        {/* WRAPPER LOGIC: If SummaryCards isn't interactive, 
          this Link allows the user to jump into the full report.
        */}
        <Link href="/protected/analytics-and-reporting" className="block hover:scale-[1.01] transition-transform duration-500">
          <SummaryCards />
        </Link>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* --- DYNAMIC MODULE DIRECTORY --- */}
        <div className="xl:col-span-2 space-y-8">
          <h2 className="text-2xl font-black tracking-tight uppercase text-slate-900 dark:text-white">Authorized Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className="group flex items-center gap-5 p-7 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
                    <div className={`p-4 rounded-2xl ${link.bg} ${link.color} group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 font-black text-base uppercase tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors relative z-10">
                      {link.name}
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all relative z-10" />
                    
                    {/* Subtle Background Glow */}
                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity ${link.bg}`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* --- SYSTEM TELEMETRY --- */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black tracking-tight uppercase text-slate-900 dark:text-white">Node Status</h2>
          <div className="bg-[#050505] p-10 rounded-[3rem] border border-slate-800 shadow-2xl font-mono text-[11px] space-y-4 text-slate-400 relative overflow-hidden">
             {/* CRT Overlay Effect */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
             
             <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                <Terminal size={16} className="text-emerald-500" />
                <p className="text-emerald-500 font-bold tracking-[0.3em] uppercase">// Audit_Buffer</p>
             </div>
             
             <p className="flex gap-4"><span className="text-slate-600 shrink-0">[08:42]</span> <span className="text-blue-500 font-bold w-12">INFO</span> Authorized: {user.id.slice(0,8)}</p>
             <p className="flex gap-4"><span className="text-slate-600 shrink-0">[09:15]</span> <span className="text-emerald-500 font-bold w-12">AUTH</span> Role: {role}</p>
             <p className="flex gap-4"><span className="text-slate-600 shrink-0">[10:02]</span> <span className="text-amber-500 font-bold w-12">SYNC</span> Node Health: Verified</p>
             
             <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-4">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                <p className="italic text-[9px] text-emerald-500/50 uppercase tracking-widest">Listening for RPC events...</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[#f8fafc] dark:bg-[#020617]">
         <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Initializing Neural Node...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}