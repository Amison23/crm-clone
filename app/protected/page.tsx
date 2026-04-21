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
  Activity,
  Headset,
  LayoutDashboard,
  Cpu
} from "lucide-react";

// Intelligence Engine Components
import SummaryCards from "@/app/ui/dashboard/analytics/components/SummaryCards";

async function DashboardContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. IDENTITY & ROLE ESCALATION (Consolidated Source of Truth)
  // We fetch from the 'employees' table as requested, with fallbacks to metadata
  const { data: profile } = await supabase
    .from("employees")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role || user.user_metadata?.role || 'sales_agent';
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Operator";

  // 2. DYNAMIC MODULE ACCESS MATRIX (Cleaned: No Duplicates)
  const allLinks = [
    { 
      name: "Global Control Plane", 
      href: "/protected/super-admin", 
      icon: Globe, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10", 
      roles: ['superadmin'],
      desc: "Platform-wide tenant & node management"
    },
    { 
      name: "Executive Console", 
      href: "/protected/executive-dashboard", 
      icon: BarChart3, 
      color: "text-primary", 
      bg: "bg-primary/10", 
      roles: ['admin', 'superadmin'],
      desc: "Strategic revenue & yield analytics"
    },
    { 
      name: "Agent Workspace", 
      href: "/protected/agent-workspace", 
      icon: LayoutDashboard, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10", 
      roles: ['sales_agent', 'admin', 'superadmin'],
      desc: "Personal task & pipeline queue"
    },
    { 
      name: "CRM Leads", 
      href: "/protected/crm-leads-table", 
      icon: Users, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10", 
      roles: ['sales_agent', 'admin', 'superadmin'],
      desc: "Lead acquisition database"
    },
    { 
      name: "Task Management", 
      href: "/protected/task-management-board", 
      icon: Target, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10", 
      roles: ['sales_agent', 'admin', 'superadmin'],
      desc: "SLA objective board"
    },
    { 
      name: "Support Tickets", 
      href: "/protected/support-tickets-list", 
      icon: Headset, 
      color: "text-rose-500", 
      bg: "bg-rose-500/10", 
      roles: ['sales_agent', 'admin', 'server_admin', 'superadmin'],
      desc: "Incident resolution node"
    },
    { 
      name: "Visual Bot Builder", 
      href: "/protected/visual-bot-builder", 
      icon: Bot, 
      color: "text-indigo-500", 
      bg: "bg-indigo-500/10", 
      roles: ['admin', 'superadmin'],
      desc: "AI routing & automated FAQs"
    },
    { 
      name: "Admin Matrix", 
      href: "/protected/admin-permissions-matrix", 
      icon: Settings, 
      color: "text-slate-500", 
      bg: "bg-slate-500/10", 
      roles: ['superadmin'],
      desc: "Global ACL & role provisioning"
    },
  ];

  // Filtering based on active user role
  const quickLinks = allLinks.filter(link => link.roles.includes(role));

  return (
    <div className="flex-1 w-full flex flex-col gap-10 p-6 lg:p-12 max-w-7xl mx-auto animate-in fade-in duration-1000">
      
      {/* --- PORTAL HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             <p className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.4em]">Node Connection: af-south-1 Online</p>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase leading-none">
            Welcome, {fullName.split(' ')[0]}<span className="text-primary">.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic text-lg">
            Authorized: <span className="font-bold text-slate-700 dark:text-slate-200 uppercase not-italic">{role.replace('_', ' ')}</span> protocol active.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Activity size={20} className="text-primary" />
           </div>
        </div>
      </header>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* --- DYNAMIC MODULE DIRECTORY --- */}
        <div className="xl:col-span-2 space-y-8">
          <h2 className="text-2xl font-black tracking-tight uppercase text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="text-primary" size={24} /> Authorized Protocols
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className="group flex flex-col p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl ${link.bg} ${link.color} group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all relative z-10" />
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="font-black text-lg uppercase tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                        {link.name}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-400 mt-1 italic">{link.desc}</p>
                    </div>
                    
                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-5 transition-opacity ${link.bg}`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* --- SYSTEM TELEMETRY SIDEBAR --- */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black tracking-tight uppercase text-slate-900 dark:text-white flex items-center gap-3">
            <Terminal size={24} className="text-emerald-500" /> Node Status
          </h2>
          <div className="bg-[#050505] p-10 rounded-[3rem] border border-slate-800 shadow-2xl font-mono text-[11px] space-y-4 text-slate-400 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
              
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2 text-emerald-500">
                <p className="font-bold tracking-[0.3em] uppercase">// Session_Audit</p>
              </div>
              
              <p className="flex gap-4"><span className="text-slate-600 shrink-0">[INIT]</span> <span className="text-blue-500 font-bold w-12">UID</span> {user.id.slice(0,8)}</p>
              <p className="flex gap-4"><span className="text-slate-600 shrink-0">[SYNC]</span> <span className="text-emerald-500 font-bold w-12">ROLE</span> {role}</p>
              <p className="flex gap-4"><span className="text-slate-600 shrink-0">[AUTH]</span> <span className="text-amber-500 font-bold w-12">ACL</span> Verified_V3</p>
              
              <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-4">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                <p className="italic text-[9px] text-emerald-500/50 uppercase tracking-widest" suppressHydrationWarning>
                  Sync_Time: {new Date().toLocaleTimeString()}
                </p>
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
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Establishing Node Link...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}