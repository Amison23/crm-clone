"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Building2, 
  Shield, 
  Globe, 
  Activity, 
  HardDrive, 
  Settings, 
  Users, 
  Hash, 
  Clock, 
  ChevronRight,
  Zap,
  Lock,
  RefreshCw,
  MoreVertical,
  ExternalLink,
  ShieldAlert,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tenant {
  id: string;
  name: string;
  created_at: string;
  deleted_at: string | null;
  user_count?: number;
  number_count?: number;
}

interface TenantManagementModalProps {
  tenant: Tenant | null;
  onClose: () => void;
}

export default function TenantManagementModal({ tenant, onClose }: TenantManagementModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "infrastructure" | "security" | "settings">("overview");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (tenant) {
      setIsClosing(false);
    }
  }, [tenant]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!tenant) return null;

  return (
    <div 
        onClick={handleClose}
        className={cn(
            "fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-md transition-all duration-300",
            isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
    >
      <div 
        className={cn(
            "bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300",
            isClosing ? "scale-95 translate-y-4" : "scale-100 translate-y-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="px-8 py-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-6">
                    <div className="size-20 rounded-[2rem] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-2xl shadow-slate-900/20">
                        <Building2 className="size-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                                {tenant?.name}
                            </h2>
                            <div className={cn(
                                "px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                tenant?.deleted_at 
                                    ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-400" 
                                    : "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400"
                            )}>
                                <div className={cn("size-1.5 rounded-full", tenant?.deleted_at ? "bg-rose-500" : "bg-emerald-500 animate-pulse")} />
                                {tenant?.deleted_at ? "Suspended Node" : "Active Node"}
                            </div>
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 font-mono text-xs mt-2 uppercase tracking-tight">
                            Identity Registry: <span className="text-slate-600 dark:text-slate-300 font-bold">{tenant?.id}</span>
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleClose}
                    className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all active:scale-90"
                >
                    <X className="size-6 text-slate-400" />
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-10">
                {[
                    { id: "overview", label: "Overview", icon: Globe },
                    { id: "infrastructure", label: "Infrastructure", icon: Server },
                    { id: "security", label: "Security & RBAC", icon: Lock },
                    { id: "settings", label: "Node Settings", icon: Settings }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all relative overflow-hidden group",
                            activeTab === tab.id 
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                    >
                        <tab.icon className={cn("size-3.5 transition-transform group-hover:scale-110", activeTab === tab.id ? "animate-pulse" : "")} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Stats Grid */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Total Users", value: tenant?.user_count || 0, icon: Users, color: "indigo" },
                                { label: "Active Numbers", value: tenant?.number_count || 0, icon: Hash, color: "orange" },
                                { label: "Provisioned On", value: new Date(tenant?.created_at || "").toLocaleDateString("en-GB"), icon: Clock, color: "emerald" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] hover:border-orange-500/30 transition-all group">
                                    <div className={cn("size-10 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:-translate-y-1", 
                                        stat.color === "indigo" ? "bg-indigo-500 text-white" : 
                                        stat.color === "orange" ? "bg-orange-500 text-white" : 
                                        "bg-emerald-500 text-white"
                                    )}>
                                        <stat.icon className="size-5" />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity Placeholder */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="size-3.5 text-orange-500" />
                                    Operational Lifecycle Logs
                                </h3>
                                <button className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline">View All Logs</button>
                            </div>
                            <div className="p-4 space-y-2">
                                {[
                                    { event: "Node Health Check", status: "Success", time: "2 mins ago" },
                                    { event: "User Provisioned", status: "Admin Action", time: "1 hour ago" },
                                    { event: "Telephony Handshake", status: "Active", time: "3 hours ago" }
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50/30 dark:bg-slate-800/20 rounded-2xl group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="size-2 bg-orange-500 rounded-full group-hover:scale-150 transition-transform" />
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.event}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{log.status}</span>
                                            <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600">{log.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Administrative Protocols</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { label: "Manage User Pool", icon: Users, sub: "RBAC \u0026 Assignments" },
                                { label: "Telephony Nodes", icon: Hash, sub: "Virtual Numbers \u0026 SIMs" },
                                { label: "Security Audit", icon: Shield, sub: "Check Policy Compliance" },
                                { label: "Regenerate Keys", icon: RefreshCw, sub: "Rotate API Infrastructure" }
                            ].map((action, i) => (
                                <button key={i} className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl group hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/5 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-500/20 transition-all">
                                            <action.icon className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{action.label}</p>
                                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter mt-0.5">{action.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="size-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>

                        {/* Dangerous Zone */}
                        <div className="mt-8 p-6 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 rounded-[2rem] space-y-4">
                             <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert className="size-3" />
                                High-Level Overrides
                             </h4>
                             <button className="w-full py-3 bg-white dark:bg-slate-900 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-sm">
                                Suspend Node Access
                             </button>
                             <p className="text-[9px] text-rose-400 font-medium text-center italic">
                                Action requires Layer 3 authentication clearance.
                             </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "infrastructure" && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <HardDrive className="size-10 text-slate-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Infrastructure Node Details</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">Physical node mapping and cloud resource allocation details for this isolated tenant.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-8">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Region</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">AWS / us-east-1</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shard ID</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">NODE_00491_B</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "security" && (
                <div className="h-full flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-10 rounded-[3rem] border border-indigo-100 dark:border-indigo-900/20 text-center space-y-6 max-w-md">
                        <div className="size-20 bg-indigo-500 text-white rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                            <Lock className="size-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-tighter italic">Encrypted Isolation</h3>
                            <p className="text-sm text-indigo-600/70 dark:text-indigo-400/50 font-medium mt-2">
                                Tenant isolation is enforced at the database level via Row Level Security (RLS). Cross-tenant leakage is strictly prohibited by platform protocol.
                            </p>
                        </div>
                        <div className="pt-4 flex flex-col gap-2">
                            <button className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                                <ExternalLink className="size-3" />
                                Audit Security Policy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Accent */}
        <div className="px-8 py-4 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Zap className="size-3 text-orange-500" />
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Real-time Node Health: 99.9% Optimal</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 dark:text-slate-600">
                <MoreVertical className="size-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">v4.0.1 Protocol</span>
            </div>
        </div>
      </div>
    </div>
  );
}
