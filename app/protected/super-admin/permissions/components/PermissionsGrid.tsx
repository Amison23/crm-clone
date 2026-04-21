"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  History, 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Loader2,
  Lock,
  Eye,
  Edit3,
  Trash,
  Download,
  MessageSquare,
  LifeBuoy,
  PhoneCall,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateRolePermission } from "../../actions";
import { toast } from "react-hot-toast";
import React from "react";

interface Permission {
  role: string;
  module: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_export: boolean;
}

interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const IconMap: Record<string, any> = {
  Users,
  MessageSquare,
  LifeBuoy,
  PhoneCall,
  Settings
};

export default function PermissionsGrid({ initialPermissions, roles, modules }: { initialPermissions: Permission[], roles: string[], modules: Module[] }) {
  const [activeRole, setActiveRole] = useState(roles[0]);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const getPermission = (module: string) => {
    return permissions.find(p => p.role === activeRole && p.module === module) || {
        role: activeRole,
        module,
        can_read: false,
        can_write: false,
        can_delete: false,
        can_export: false
    };
  };

  const togglePermission = async (module: string, field: keyof Permission) => {
    const current = getPermission(module);
    const updated = { ...current, [field]: !current[field] };
    const updateKey = `${module}-${field}`;

    setIsUpdating(updateKey);
    
    // Update locally
    setPermissions(prev => {
        const other = prev.filter(p => !(p.role === activeRole && p.module === module));
        return [...other, updated as Permission];
    });

    // Update server
    const result = await updateRolePermission(activeRole, module, { 
        can_read: updated.can_read,
        can_write: updated.can_write,
        can_delete: updated.can_delete,
        can_export: updated.can_export
    });

    setIsUpdating(null);

    if (!result.success) {
        // Rollback
        setPermissions(prev => {
            const other = prev.filter(p => !(p.role === activeRole && p.module === module));
            return [...other, current];
        });
        toast.error(result.error || "Failed to update permission");
    } else {
        toast.success(`Updated ${module} for ${activeRole}`, { id: "perm-update", duration: 1000 });
    }
  };

  return (
    <div className="space-y-8">
      {/* Role Selection Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-8 overflow-x-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-t-[2.5rem] px-8">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={cn(
              "px-4 py-6 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
              activeRole === role 
                ? "border-orange-500 text-orange-600 dark:text-orange-400" 
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            {role.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Permissions Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-b-[2.5rem] border-x border-b border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-100/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 min-w-[240px]">Global Infrastructure Module</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 text-center">Read</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 text-center">Write</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 text-center">Delete</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 text-center">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {modules.map((mod) => (
                <ModuleRow 
                    key={mod.id} 
                    module={mod} 
                    permission={getPermission(mod.id)} 
                    onToggle={(field) => togglePermission(mod.id, field)}
                    isSuperAdmin={activeRole === "superadmin"}
                    isUpdating={isUpdating}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 font-mono text-[9px] uppercase font-bold text-slate-400">
            <div className="flex items-center gap-2">
                <Lock className="size-3 text-orange-500" />
                Real-time RBAC Enforcement: Active
            </div>
            <div>
                System Node Pool Ver v1.0.5
            </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-4 shadow-sm group">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl text-orange-600 transition-transform group-hover:rotate-12">
              <History className="size-5" />
            </div>
            <div>
              <h4 className="font-black text-[11px] uppercase tracking-widest mb-1 text-slate-900 dark:text-white">Audit History</h4>
              <p className="text-[10px] text-slate-500 font-medium italic">Track every permission change for global compliance.</p>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-4 shadow-sm group">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl text-emerald-600 transition-transform group-hover:-rotate-12">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="font-black text-[11px] uppercase tracking-widest mb-1 text-slate-900 dark:text-white">Security Rating</h4>
              <p className="text-[10px] text-slate-500 font-medium italic">RBAC config adheres to Zero Trust principles.</p>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-4 shadow-sm group">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl text-blue-600 transition-transform group-hover:scale-110">
              <Users className="size-5" />
            </div>
            <div>
              <h4 className="font-black text-[11px] uppercase tracking-widest mb-1 text-slate-900 dark:text-white">Role Density</h4>
              <p className="text-[10px] text-slate-500 font-medium italic">Total 5 roles mapped across 5 core modules.</p>
            </div>
          </div>
      </div>
    </div>
  );
}

function ModuleRow({ 
  module, 
  permission, 
  onToggle, 
  isSuperAdmin, 
  isUpdating 
}: { 
  module: Module, 
  permission: Permission, 
  onToggle: (field: keyof Permission) => void, 
  isSuperAdmin: boolean, 
  isUpdating: string | null 
}) {
  const Icon = IconMap[module.icon] || ShieldCheck;
  
  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
             <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{module.name}</p>
            <p className="text-[10px] text-slate-400 truncate italic font-medium">{module.description}</p>
          </div>
          {isUpdating?.startsWith(`${module.id}-`) && (
              <Loader2 className="size-3 animate-spin text-orange-500 ml-auto" />
          )}
        </div>
      </td>
      
      <PermissionCell 
        checked={permission.can_read} 
        onToggle={() => onToggle("can_read")} 
        disabled={isSuperAdmin}
        isUpdating={isUpdating === `${module.id}-can_read`}
        icon={<Eye className="size-4" />}
      />
      <PermissionCell 
        checked={permission.can_write} 
        onToggle={() => onToggle("can_write")} 
        disabled={isSuperAdmin}
        isUpdating={isUpdating === `${module.id}-can_write`}
        icon={<Edit3 className="size-4" />}
      />
      <PermissionCell 
        checked={permission.can_delete} 
        onToggle={() => onToggle("can_delete")} 
        disabled={isSuperAdmin}
        isUpdating={isUpdating === `${module.id}-can_delete`}
        icon={<Trash className="size-4" />}
      />
      <PermissionCell 
        checked={permission.can_export} 
        onToggle={() => onToggle("can_export")} 
        disabled={isSuperAdmin}
        isUpdating={isUpdating === `${module.id}-can_export`}
        icon={<Download className="size-4" />}
      />
    </tr>
  );
}

function PermissionCell({ checked, onToggle, disabled, icon, isUpdating }: { checked: boolean, onToggle: () => void, disabled: boolean, icon: React.ReactNode, isUpdating: boolean }) {
  return (
    <td className="px-6 py-6 text-center">
      <div className="flex justify-center">
        <button
          disabled={disabled || isUpdating}
          onClick={onToggle}
          className={cn(
            "p-3 rounded-2xl transition-all active:scale-90 border flex items-center justify-center group-hover:scale-110 relative",
            disabled ? "opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300" :
            checked 
              ? "bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20" 
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 hover:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm"
          )}
        >
          {isUpdating ? (
              <Loader2 className="size-4 animate-spin" />
          ) : icon}
        </button>
      </div>
    </td>
  );
}
