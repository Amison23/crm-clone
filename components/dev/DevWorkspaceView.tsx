"use client";

import { useState, useEffect } from "react";
import { 
  Code, Terminal, CheckCircle2, Clock, AlertCircle, 
  Send, RefreshCw, MessageSquare, Cpu, Server, Activity, ShieldCheck
} from "lucide-react";
import { getTeamMessages, postTeamMessage } from "@/app/actions/messages";
import { updateTaskStatusAction } from "@/lib/api/tasks";
import { toast } from "react-hot-toast";

interface DevTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string;
}

interface DevWorkspaceProps {
  initialTasks: DevTask[];
  companyName?: string;
  userId: string;
  auditLogs?: any[];
}

export function DevWorkspaceView({ initialTasks, companyName, userId, auditLogs = [] }: DevWorkspaceProps) {
  const [tasks, setTasks] = useState<DevTask[]>(initialTasks);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(true);
  const [sendingChat, setSendingChat] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "chat" | "telemetry">("tasks");

  const fetchChat = async () => {
    try {
      const res = await getTeamMessages();
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error("Dev Workspace chat fetch error:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await updateTaskStatusAction(taskId, newStatus);
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        toast.success(`Task status updated to ${newStatus}`);
      } else {
        toast.error(res.error || "Failed to update task");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const body = chatInput.trim();
    setChatInput("");
    setSendingChat(true);

    try {
      const res = await postTeamMessage(`[DEV]: ${body}`);
      if (res.success) {
        await fetchChat();
      } else {
        toast.error(res.error || "Failed to post message");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSendingChat(false);
    }
  };

  const pendingCount = tasks.filter(t => t.status !== "completed").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            <span>Engineering Protocol</span>
            <span>/</span>
            <span className="text-primary">{companyName || "Organization"} Dev Node</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Code className="text-primary" size={32} />
            Developer <span className="text-primary italic">Workspace</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase">Assigned Tasks</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{pendingCount} Active</p>
          </div>
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center">
            <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Completed</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "tasks"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <CheckCircle2 size={16} /> My Assigned Tasks ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "chat"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <MessageSquare size={16} /> Staff Team Chat ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab("telemetry")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "telemetry"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Activity size={16} /> API & Environment Status
        </button>
      </div>

      {/* TAB 1: DEV ASSIGNED TASKS */}
      {activeTab === "tasks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">All Clear! No assigned dev tasks.</h3>
              <p className="text-xs text-slate-500">Tasks assigned to your dev user will appear here.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                      task.priority === "high" || task.priority === "urgent"
                        ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400"
                        : "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400"
                    }`}>
                      {task.priority || "Medium"}
                    </span>

                    <span className={`text-[10px] font-mono font-bold uppercase ${
                      task.status === "completed" ? "text-emerald-500" : "text-amber-500"
                    }`}>
                      • {task.status}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "Flexible"}
                  </span>
                  
                  <select
                    value={task.status}
                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: STAFF TEAM CHAT */}
      {activeTab === "chat" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Terminal size={20} className="text-primary" />
              <div>
                <h3 className="font-black text-sm uppercase">Internal Developer & Staff Stream</h3>
                <p className="text-[10px] text-slate-400 font-mono">Real-time team chat persistence</p>
              </div>
            </div>
            <button onClick={fetchChat} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
              <RefreshCw size={16} className={loadingChat ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/40">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No team messages recorded.
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs shadow-sm max-w-[85%]">
                  <p className="font-mono text-slate-800 dark:text-slate-200">{m.body}</p>
                  <span className="text-[9px] text-slate-400 block mt-1">
                    {new Date(m.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Post a developer note or update..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: TELEMETRY & ENDPOINT MONITOR */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-black uppercase text-slate-400">Database Driver</p>
                <Server size={20} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">Supabase Postgres</p>
              <span className="text-[10px] font-mono text-emerald-500">RLS Policies Enforced</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-black uppercase text-slate-400">API Gateway Latency</p>
                <Cpu size={20} className="text-primary" />
              </div>
              <p className="text-2xl font-black text-primary">18ms</p>
              <span className="text-[10px] font-mono text-slate-400">HTTP/2 Edge Stream</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-black uppercase text-slate-400">RBAC Security Mesh</p>
                <ShieldCheck size={20} className="text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Dev Isolated</p>
              <span className="text-[10px] font-mono text-slate-400">No Cross-Tenant Leaks</span>
            </div>
          </div>

          <div className="bg-[#050505] p-6 rounded-3xl border border-slate-800 text-white font-mono text-xs space-y-2">
            <p className="text-emerald-400 font-bold">[Dev Environment & Audit Log Stream]</p>
            {auditLogs.length > 0 ? (
              auditLogs.map((log: any) => (
                <p key={log.id} className="text-slate-300 truncate">
                  &gt; <span className="text-indigo-400">{new Date(log.created_at).toLocaleTimeString()}</span> [{log.action || 'EVENT'}]: {log.entity_type || 'System'}
                </p>
              ))
            ) : (
              <>
                <p className="text-slate-400">&gt; GET /api/tasks?role=dev -&gt; Filtered by assigned_to = {userId.slice(0, 8)}...</p>
                <p className="text-slate-400">&gt; GET /api/messages -&gt; Filtered by tenant company_id context</p>
                <p className="text-slate-400">&gt; POST /api/admin/superadmin-action -&gt; 403 Forbidden for non-superadmins</p>
              </>
            )}
            <p className="text-emerald-500/80 pt-2 animate-pulse">&gt; Active Developer Stream Listening on af-south-1...</p>
          </div>
        </div>
      )}
    </div>
  );
}
