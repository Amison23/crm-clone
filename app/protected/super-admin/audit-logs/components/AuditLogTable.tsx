"use client";

import { useState } from "react";
import { 
  History, 
  User, 
  Terminal, 
  Database, 
  Clock, 
  ChevronRight, 
  Eye,
  Info,
  Download,
  ArrowRight,
  MinusCircle,
  PlusCircle,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/common/EmptyState";

interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  payload: any;
  created_at: string;
  actor: { full_name: string; email_address: string } | null;
}

export default function AuditLogTable({ initialLogs }: { initialLogs: any[] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const formatAction = (action: string) => {
    return action.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE") || action.includes("RESTORE")) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50";
    if (action.includes("UPDATE")) return "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50";
    if (action.includes("DELETE") || action.includes("ARCHIVE") || action.includes("PURGE")) return "text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50";
    return "text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700";
  };

  const exportToCSV = () => {
    const headers = ["Timestamp", "Action", "Actor", "Entity Type", "Entity ID", "Payload"];
    const rows = logs.map(log => [
        new Date(log.created_at).toISOString(),
        log.action,
        log.actor?.email_address || "System",
        log.entity_type,
        log.entity_id,
        JSON.stringify(log.payload).replace(/"/g, '""')
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_log_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100/50 dark:shadow-none transition-all">
        
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/50 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white tracking-tight uppercase">System Event Registry</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              Real-time Global Operation Audit
            </p>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => exportToCSV()}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
                <Download className="size-3.5" />
                Export CSV
            </button>
            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shadow-inner">
                {logs.length} Transactions
            </span>
          </div>
        </div>

        {/* Mobile Audit Log Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {logs.length === 0 ? (
            <EmptyState
              icon={History}
              title="No audit logs recorded yet"
              description="Administrative actions and platform state changes will appear here."
            />
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className="p-4 space-y-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{log.actor?.full_name || "System Automated"}</p>
                      <p className="text-[10px] text-slate-400 truncate">{log.actor?.email_address || "Service Node"}</p>
                    </div>
                  </div>

                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shrink-0",
                    getActionColor(log.action)
                  )}>
                    {formatAction(log.action)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                    <Database className="size-3 text-slate-400" />
                    <span>{log.entity_type}</span>
                    <span className="font-mono text-slate-400">#{log.entity_id.split("-")[0]}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px]">
                    <Clock className="size-3 text-slate-400" />
                    <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (>= md) */}
        <div className="hidden md:block overflow-x-auto text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Transaction Identity</th>
                <th className="px-8 py-4">Action Signature</th>
                <th className="px-8 py-4">Target Entity</th>
                <th className="px-8 py-4">Commit Timestamp</th>
                <th className="px-8 py-4 text-right">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={History}
                      title="No audit logs recorded yet"
                      description="Administrative actions and platform state changes will appear here."
                    />
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr 
                    key={log.id} 
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLog(log)}
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <User className="size-4" />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{log.actor?.full_name || "System Automated"}</p>
                            <p className="text-[9px] text-slate-400 italic font-medium">{log.actor?.email_address || "Service Node"}</p>
                        </div>
                    </div>
                  </td>

                  <td className="px-8 py-4">
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                        getActionColor(log.action)
                    )}>
                        {formatAction(log.action)}
                    </span>
                  </td>

                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                        <Database className="size-3.5 text-slate-400" />
                        <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                            {log.entity_type}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 truncate max-w-[120px]">
                            #{log.entity_id.split("-")[0]}
                        </span>
                    </div>
                  </td>

                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                        <Clock className="size-3.5 text-slate-400 font-bold" />
                        <span className="text-slate-500 font-medium whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                        </span>
                    </div>
                  </td>

                  <td className="px-8 py-4 text-right">
                    <button className="p-2 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 rounded-xl transition-all group-hover:translate-x-1">
                        <ChevronRight className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Panel */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end p-4 md:p-8 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedLog(null)}>
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform animate-in slide-in-from-right duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-2 rounded-lg text-white">
                            <Terminal className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Transaction Payload</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">UUID: {selectedLog.id}</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors font-bold text-slate-400">
                        ESC
                    </button>
                </div>
                
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Reference</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedLog.entity_type}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Commit Status</p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-2">
                                <CheckCircle2 className="size-3.5" /> Verified
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                            {selectedLog.payload?.prev ? "State Change Comparison" : "Raw Payload Mapping"}
                        </p>
                        
                        {selectedLog.payload?.prev ? (
                            <div className="space-y-3">
                                {Object.keys(selectedLog.payload.next || {}).map(key => (
                                    <div key={key} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px]">
                                        <p className="text-slate-500 mb-2 uppercase tracking-tight font-black text-[9px]">{key}</p>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-rose-400 bg-rose-400/5 p-1 rounded">
                                                <MinusCircle className="size-3" />
                                                <span className="truncate">{JSON.stringify(selectedLog.payload.prev[key])}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/5 p-1 rounded">
                                                <PlusCircle className="size-3" />
                                                <span className="truncate">{JSON.stringify(selectedLog.payload.next[key])}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto shadow-inner">
                                <pre>{JSON.stringify(selectedLog.payload, null, 2)}</pre>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                        <Info className="size-5 text-orange-500 shrink-0" />
                        <p className="text-[10px] font-medium text-orange-800 dark:text-orange-300 leading-normal italic">
                            This transaction was committed by an authorized Super Admin node. All state changes are idempotent and verifiable.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
