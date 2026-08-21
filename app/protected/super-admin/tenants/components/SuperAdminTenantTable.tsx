"use client";

import { useState } from "react";
import { 
  Search, 
  MoreHorizontal, 
  Archive, 
  RotateCcw, 
  Trash2, 
  Edit,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { archiveTenant, restoreTenant, purgeTenant } from "../../actions";
import { toast } from "react-hot-toast";
import TenantDialog from "./TenantDialog";
import TenantManagementModal from "./TenantManagementModal";
import EmptyState from "@/components/common/EmptyState";

interface Tenant {
  id: string;
  name: string;
  created_at: string;
  deleted_at: string | null;
  user_count?: number;
  number_count?: number;
}

export default function SuperAdminTenantTable({ initialTenants }: { initialTenants: Tenant[] }) {
  const [tenants, setTenants] = useState(initialTenants);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
        filter === "all" ? true :
        filter === "active" ? !t.deleted_at :
        !!t.deleted_at;
    return matchesSearch && matchesFilter;
  });

  const handleArchive = async (id: string) => {
    const result = await archiveTenant(id);
    if (result.success) {
      setTenants(prev => prev.map(t => t.id === id ? { ...t, deleted_at: new Date().toISOString() } : t));
      toast.success("Tenant archived successfully");
    } else {
      toast.error(result.error || "Failed to archive tenant");
    }
  };

  const handleRestore = async (id: string) => {
    const result = await restoreTenant(id);
    if (result.success) {
      setTenants(prev => prev.map(t => t.id === id ? { ...t, deleted_at: null } : t));
      toast.success("Tenant restored successfully");
    } else {
      toast.error(result.error || "Failed to restore tenant");
    }
  };

  const handlePurge = async (id: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this tenant? This action cannot be undone.")) return;
    const result = await purgeTenant(id);
    if (result.success) {
      setTenants(prev => prev.filter(t => t.id !== id));
      toast.success("Tenant purged from system registry");
    } else {
      toast.error(result.error || "Failed to purge tenant");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
      
      {/* Search and Filters */}
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search infrastructure nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            {[
                { id: "all", label: "All Nodes" },
                { id: "active", label: "Active" },
                { id: "archived", label: "Archived" }
            ].map((f) => (
                <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        filter === f.id 
                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg" 
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                >
                    {f.label}
                </button>
            ))}
        </div>
      </div>

      {/* Mobile Tenant Cards (< md) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {filteredTenants.length > 0 ? (
          filteredTenants.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTenant(t)}
              className="p-4 space-y-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{t.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">UUID: {t.id}</p>
                </div>

                {t.deleted_at ? (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-lg shrink-0">
                    <XCircle className="size-3 text-rose-600 dark:text-rose-400" />
                    <span className="text-[9px] font-black text-rose-700 dark:text-rose-400 uppercase">Archived</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg shrink-0">
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase">Active</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                  <Users className="size-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{t.user_count || 0} Users</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                  <Hash className="size-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{t.number_count || 0} Numbers</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 ml-auto">
                  <Clock className="size-3" />
                  <span>{new Date(t.created_at).toLocaleDateString("en-GB")}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                <TenantDialog mode="edit" tenant={t} onSuccess={() => window.location.reload()}>
                  <button className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:text-blue-600 transition-all text-xs font-semibold flex items-center gap-1">
                    <Edit className="size-3.5" /> Edit
                  </button>
                </TenantDialog>

                {t.deleted_at ? (
                  <button 
                    onClick={() => handleRestore(t.id)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:text-emerald-600 transition-all text-xs font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="size-3.5" /> Restore
                  </button>
                ) : (
                  <button 
                    onClick={() => handleArchive(t.id)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:text-rose-600 transition-all text-xs font-semibold flex items-center gap-1"
                  >
                    <Archive className="size-3.5" /> Archive
                  </button>
                )}
                
                <button 
                  onClick={() => handlePurge(t.id)}
                  className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="size-3.5" /> Purge
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Search}
            title="No tenants match"
            description="Try adjusting search or status filter."
          />
        )}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
            <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-8 py-4">Node Profile</th>
              <th className="px-8 py-4">Added on</th>
              <th className="px-8 py-4">Health Status</th>
              <th className="px-8 py-4 text-right">Administrative Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {filteredTenants.length > 0 ? filteredTenants.map((t) => (
              <tr 
                onClick={() => setSelectedTenant(t)}
                key={t.id} 
                className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-300 border-l-2 border-transparent hover:border-orange-500"
              >
                <td className="px-8 py-5">
                  <p className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                    {t.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                        <Users className="size-3 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{t.user_count} Users</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                        <Hash className="size-3 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{t.number_count} Numbers</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 uppercase tracking-tighter">
                    UUID: {t.id}
                  </p>
                </td>

                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                        {new Date(t.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </td>

                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    {t.deleted_at ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-lg">
                            <XCircle className="size-3 text-rose-600 dark:text-rose-400" />
                            <span className="text-[9px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest">Archived</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg">
                            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Operational</span>
                        </div>
                    )}
                  </div>
                </td>

                <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100" onClick={(e) => e.stopPropagation()}>
                        <TenantDialog mode="edit" tenant={t} onSuccess={() => window.location.reload()}>
                            <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 hover:text-blue-600 transition-all active:scale-95 shadow-sm overflow-hidden">
                                <Edit className="size-4" />
                            </button>
                        </TenantDialog>

                        {t.deleted_at ? (
                            <button 
                                onClick={() => handleRestore(t.id)}
                                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95 shadow-sm"
                            >
                                <RotateCcw className="size-4" />
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleArchive(t.id)}
                                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 shadow-sm"
                            >
                                <Archive className="size-4" />
                            </button>
                        )}
                        
                        <button 
                            onClick={() => handlePurge(t.id)}
                            className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-200 dark:shadow-none"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4}>
                  {tenants.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No tenants provisioned yet"
                      description="Use 'New Company' above to provision the first workspace."
                    />
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="No tenants match this filter"
                      description="Try adjusting the search term or switching the status filter."
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-4 bg-slate-50/30 dark:bg-slate-800/30 text-center">
        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
          Platform Infrastructure Registry Pool • Total Count: {filteredTenants.length}
        </p>
      </div>

      <TenantManagementModal 
        tenant={selectedTenant} 
        onClose={() => setSelectedTenant(null)} 
      />
    </div>
  );
}
