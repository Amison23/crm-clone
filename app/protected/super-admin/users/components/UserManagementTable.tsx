"use client";

import { useState } from "react";
import { 
  Users, 
  Shield, 
  Building2, 
  Mail, 
  Check, 
  ChevronDown, 
  Loader2,
  AlertCircle,
  KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateUserRole } from "../../actions";
import { toast } from "react-hot-toast";
import EmptyState from "@/components/common/EmptyState";
import { ResetPasswordModal } from "@/components/common/ResetPasswordModal";

interface User {
  id: string;
  email_address: string;
  full_name: string;
  role: string | null;
  company_id: string | null;
  companies: { name: string } | null;
}

interface Company {
  id: string;
  name: string;
}

export default function UserManagementTable({ initialUsers, companies }: { initialUsers: User[], companies: Company[] }) {
  const [employees, setEmployees] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  const roles = [
    { value: "superadmin", label: "Super Admin", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    { value: "admin", label: "Company Admin", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { value: "sales_agent", label: "Sales Agent", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { value: "support", label: "Support Agent", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    { value: "billing", label: "Billing Admin", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" }
  ];

  const handleUpdate = async (userId: string, role: string, companyId: string | null) => {
    try {
        const result = await updateUserRole(userId, role, companyId);
        if (result.success) {
            setEmployees(prev => prev.map(u => 
                u.id === userId ? { 
                    ...u, 
                    role, 
                    company_id: companyId,
                    companies: companies.find(c => c.id === companyId) || null
                } : u
            ));
            toast.success("Identity updated successfully");
        } else {
            toast.error(result.error || "Failed to update user identity");
        }
    } catch (err) {
        toast.error("System connection failure");
    } finally {
        setLoadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100/50 dark:shadow-none">
      
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/50 flex justify-between items-center">
        <div>
          <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-xl uppercase">Active Identities</h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Global User RBAC & Tenant Mapping
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {employees.length} Users Indexed
            </span>
        </div>
      </div>

      <div className="overflow-x-auto text-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
            <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-8 py-4">Identity Profile</th>
              <th className="px-8 py-4">Assigned Role</th>
              <th className="px-8 py-4">Infrastructure Lock (Tenant)</th>
              <th className="px-8 py-4 text-right">Commit Changes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    icon={Users}
                    title="No users found"
                    description="Users appear here once provisioned via tenant creation or direct agent provisioning."
                  />
                </td>
              </tr>
            ) : employees.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                roles={roles}
                companies={companies}
                onUpdate={handleUpdate}
                onResetPassword={() => setResettingUser(u)}
                isLoading={loadingId === u.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {resettingUser && (
        <ResetPasswordModal
          user={resettingUser}
          onClose={() => setResettingUser(null)}
        />
      )}
    </div>
  );
}

function UserRow({ user, roles, companies, onUpdate, onResetPassword, isLoading }: { 
    user: User, 
    roles: any[], 
    companies: Company[], 
    onUpdate: (userId: string, role: string, companyId: string | null) => void,
    onResetPassword: () => void,
    isLoading: boolean
}) {
  const [role, setRole] = useState(user.role || "sales_agent");
  const [companyId, setCompanyId] = useState<string | null>(user.company_id);

  const hasChanges = role !== user.role || companyId !== user.company_id;

  return (
    <tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex flex-col items-center justify-center text-xs font-black uppercase text-slate-500 relative shrink-0">
                {user.full_name?.substring(0, 2) || "U"}
                {isLoading && <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-spin"><Loader2 className="size-4" /></div>}
            </div>
            <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">{user.full_name || "Unknown Identity"}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    <Mail className="size-3" />
                    <span className="truncate">{user.email_address}</span>
                </div>
            </div>
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="relative group/role">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 transition-colors group-focus-within/role:text-orange-500" />
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="pl-8 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer appearance-none"
            >
                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
        </div>
      </td>

      <td className="px-8 py-5">
        <div className="relative group/company">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 transition-colors group-focus-within/company:text-orange-500" />
            <select
                disabled={role === "superadmin"}
                value={companyId || ""}
                onChange={(e) => setCompanyId(e.target.value || null)}
                className={cn(
                    "pl-8 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer appearance-none min-w-[200px]",
                    role === "superadmin" && "opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-950"
                )}
            >
                <option value="">Global (No Tenant)</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
        </div>
      </td>

      <td className="px-8 py-5 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onResetPassword}
            title="Reset/Generate Password"
            className="p-2 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
          >
            <KeyRound className="size-4" />
          </button>

          <button 
              disabled={!hasChanges || isLoading}
              onClick={() => onUpdate(user.id, role, companyId)}
              className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                  hasChanges 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" 
                      : "bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
              )}
          >
              {isLoading ? <Loader2 className="animate-spin size-3" /> : <Check className="size-3" />}
              Save Commit
          </button>
        </div>
      </td>
    </tr>
  );
}
