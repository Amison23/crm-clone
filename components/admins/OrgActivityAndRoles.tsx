"use client";

import { useState, useEffect } from "react";
import { getWorkerActivityLogs } from "@/app/actions/activity";
import { getOrgRoles, createOrgRole, deleteOrgRole } from "@/app/actions/org-roles";
import { toast } from "react-hot-toast";

// ─── Worker Activity Monitoring Tab ──────────────────────────────────────────

export function ActivityTab({ companyId }: { companyId?: string | null }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getWorkerActivityLogs(companyId || undefined);
      if (res.success && res.logs) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error("Error fetching worker activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [companyId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">monitoring</span>
            Worker Activity Telemetry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time agent status, idle duration tracking, and mouse interaction monitoring.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">{loading ? "sync" : "refresh"}</span>
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Agent</th>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Role</th>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Status</th>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Idle Duration</th>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Last Mouse Activity</th>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    No active agent telemetry recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {log.employees?.full_name || log.employees?.email_address || "Agent"}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500 capitalize">
                      {log.employees?.role?.replace("_", " ") || "Sales Agent"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1.5 ${
                        log.status === "active"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        <span className={`size-1.5 rounded-full ${log.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                      {log.idle_seconds ?? 0} seconds
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {log.last_mouse_activity
                        ? new Date(log.last_mouse_activity).toLocaleTimeString()
                        : "Active"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(log.recorded_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Org Custom Roles & Worker Filtering Tab ──────────────────────────────────

export function RolesTab({ companyId, onSelectRoleFilter }: { companyId?: string | null, onSelectRoleFilter?: (roleName: string) => void }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await getOrgRoles(companyId || undefined);
      if (res.success && res.roles) {
        setRoles(res.roles);
      }
    } catch (err) {
      console.error("Error fetching org roles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [companyId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createOrgRole(roleName.trim(), roleDesc.trim(), ["read", "write"], companyId || undefined);
      if (res.success) {
        toast.success("Org custom role created!");
        setIsCreating(false);
        setRoleName("");
        setRoleDesc("");
        fetchRoles();
      } else {
        toast.error(res.error || "Failed to create role");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this custom role?")) return;
    try {
      const res = await deleteOrgRole(roleId);
      if (res.success) {
        toast.success("Role deleted");
        fetchRoles();
      } else {
        toast.error(res.error || "Failed to delete role");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">badge</span>
            Organization Custom Roles & Worker Filtering
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Define custom roles scoped exclusively to your organization and filter workers.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <span className="material-symbols-outlined text-5xl mb-3">badge</span>
            <p className="font-semibold text-sm">No custom roles created for this organization yet.</p>
          </div>
        ) : (
          roles.map((r) => (
            <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">{r.name}</h3>
                  <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                {r.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{r.description}</p>}
                <span className="inline-block px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase border border-indigo-100 dark:border-indigo-800/50">
                  Org Scoped
                </span>
              </div>
              {onSelectRoleFilter && (
                <button
                  onClick={() => onSelectRoleFilter(r.name)}
                  className="mt-4 w-full py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-900/30 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">filter_alt</span>
                  Filter Workers by this Role
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Create Org Custom Role</h2>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Role Name</label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. Senior Support Lead"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Description</label>
                <textarea
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Short description of responsibilities..."
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Creating..." : "Save Custom Role"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
