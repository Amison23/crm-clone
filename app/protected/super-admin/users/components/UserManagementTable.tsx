"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Shield,
  Building2,
  Mail,
  Check,
  ChevronDown,
  Loader2,
  KeyRound,
  ChevronRight,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateUserRole } from "../../actions";
import { toast } from "react-hot-toast";
import { ResetPasswordModal } from "@/components/common/ResetPasswordModal";

interface User {
  id: string;
  email_address: string;
  full_name: string;
  role: string | null;
  company_id: string | null;
  companies: { name: string } | null;
  updated_at?: string;
}

interface Company {
  id: string;
  name: string;
}

// ─── Role definitions ────────────────────────────────────────────────────────
const ROLES = [
  { value: "superadmin",   label: "Super Admin",     color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { value: "admin",        label: "Company Admin",   color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "sales_agent",  label: "Sales Agent",     color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { value: "server_admin", label: "Server Admin",    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "dev",          label: "Developer",       color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { value: "support",      label: "Support Agent",   color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
];

function getRoleMeta(role: string | null) {
  return ROLES.find((r) => r.value === role) ?? { value: role ?? "", label: role ?? "Unknown", color: "bg-slate-100 text-slate-500" };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UserManagementTable({
  initialUsers,
  companies,
}: {
  initialUsers: User[];
  companies: Company[];
}) {
  const [employees, setEmployees] = useState(initialUsers);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  // Group users by company_id
  const grouped = useMemo(() => {
    const map = new Map<string | null, User[]>();
    for (const u of employees) {
      const key = u.company_id ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(u);
    }
    return map;
  }, [employees]);

  // Build sidebar items: real companies first (sorted), then "Unassigned"
  const sidebarItems: Array<{ id: string | null; name: string }> = [
    ...companies.map((c) => ({ id: c.id, name: c.name })),
    { id: null, name: "Unassigned / Global" },
  ];

  const selectedUsers = grouped.get(selectedCompanyId ?? null) ?? [];
  const selectedCompany = selectedCompanyId
    ? companies.find((c) => c.id === selectedCompanyId)
    : null;

  const handleUpdate = async (userId: string, role: string, companyId: string | null) => {
    setLoadingId(userId);
    try {
      const result = await updateUserRole(userId, role, companyId);
      if (result.success) {
        setEmployees((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  role,
                  company_id: companyId,
                  companies: companies.find((c) => c.id === companyId) || null,
                  updated_at: new Date().toISOString(),
                }
              : u
          )
        );
        toast.success("User updated successfully");
      } else {
        toast.error(result.error || "Failed to update user");
      }
    } catch {
      toast.error("Connection error — please try again");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-100/50 dark:shadow-none">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex justify-between items-center">
        <div>
          <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-lg uppercase">
            Team Members
          </h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            Global User RBAC & Company Mapping
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <Users className="size-3.5" />
          {employees.length} Users
        </div>
      </div>

      {/* ── Two-panel layout ─────────────────────────────────────────────────── */}
      <div className="flex min-h-[520px]">

        {/* ── Left: Company sidebar ──────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/60 overflow-y-auto">
          <p className="px-4 pt-5 pb-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Companies · {sidebarItems.length - 1} tenants
          </p>
          <ul className="pb-4 space-y-0.5 px-2">
            {sidebarItems.map(({ id, name }) => {
              const usersInCo = grouped.get(id) ?? [];
              const admins = usersInCo.filter((u) => u.role === "admin");
              const isSelected =
                id === null
                  ? selectedCompanyId === null && selectedCompanyId !== undefined
                  : selectedCompanyId === id;

              return (
                <li key={id ?? "__unassigned"}>
                  <button
                    onClick={() => setSelectedCompanyId(id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl transition-all group",
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn(
                          "size-7 rounded-lg flex items-center justify-center shrink-0",
                          id === null
                            ? isSelected ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"
                            : isSelected ? "bg-white/20" : "bg-indigo-100 dark:bg-indigo-900/30"
                        )}>
                          <Building2 className={cn(
                            "size-3.5",
                            isSelected ? "text-white" : id === null ? "text-slate-400" : "text-indigo-600 dark:text-indigo-400"
                          )} />
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            "text-xs font-bold truncate",
                            isSelected ? "text-white" : "text-slate-800 dark:text-slate-200"
                          )}>
                            {name}
                          </p>
                          <p className={cn(
                            "text-[9px] font-semibold truncate",
                            isSelected ? "text-white/70" : "text-slate-400"
                          )}>
                            {usersInCo.length} member{usersInCo.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "size-3.5 shrink-0 transition-transform",
                        isSelected ? "text-white rotate-90" : "text-slate-300 dark:text-slate-600"
                      )} />
                    </div>

                    {/* Admin badges */}
                    {admins.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {admins.slice(0, 2).map((a) => (
                          <span
                            key={a.id}
                            className={cn(
                              "inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-full",
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            )}
                          >
                            <Crown className="size-2.5 shrink-0" />
                            <span className="truncate">{a.full_name?.split(" ")[0] ?? "Admin"}</span>
                          </span>
                        ))}
                        {admins.length > 2 && (
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                            isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                          )}>
                            +{admins.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── Right: User list ───────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          {selectedCompanyId === undefined ? (
            // Nothing selected yet
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8 gap-3">
              <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                <Building2 className="size-6 text-slate-400" />
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-300">Select a company</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
                Choose a company from the left panel to view and manage its team members.
              </p>
            </div>
          ) : selectedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8 gap-3">
              <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                <Users className="size-6 text-slate-400" />
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-300">No members yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
                {selectedCompany
                  ? `${selectedCompany.name} has no assigned team members.`
                  : "No unassigned users found."}
              </p>
            </div>
          ) : (
            <>
              {/* Company heading inside panel */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/20 flex items-center gap-3">
                <div className="size-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Building2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-black text-sm text-slate-900 dark:text-white">
                    {selectedCompany?.name ?? "Unassigned / Global"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {selectedUsers.length} team member{selectedUsers.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Desktop table */}
              <table className="w-full text-left border-collapse text-sm hidden md:table">
                <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                  <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">
                    <th className="px-5 py-3">Member</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Password</th>
                    <th className="px-5 py-3 text-right">Save</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedUsers.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      companies={companies}
                      onUpdate={handleUpdate}
                      onResetPassword={() => setResettingUser(u)}
                      isLoading={loadingId === u.id}
                    />
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
                {selectedUsers.map((u) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    companies={companies}
                    onUpdate={handleUpdate}
                    onResetPassword={() => setResettingUser(u)}
                    isLoading={loadingId === u.id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
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

// ─── UserRow (desktop table row) ─────────────────────────────────────────────
function UserRow({
  user,
  companies,
  onUpdate,
  onResetPassword,
  isLoading,
}: {
  user: User;
  companies: Company[];
  onUpdate: (userId: string, role: string, companyId: string | null) => void;
  onResetPassword: () => void;
  isLoading: boolean;
}) {
  const [role, setRole] = useState(user.role || "sales_agent");
  const [companyId, setCompanyId] = useState<string | null>(user.company_id);
  const hasChanges = role !== user.role || companyId !== user.company_id;
  const roleMeta = getRoleMeta(role);

  return (
    <tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      {/* Identity */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black text-white relative shrink-0">
            {(user.full_name ?? "U").substring(0, 2).toUpperCase()}
            {isLoading && (
              <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Loader2 className="size-4 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
              {user.full_name || "Unknown"}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <Mail className="size-3" />
              <span className="truncate">{user.email_address}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-5 py-3">
        <div className="relative inline-block">
          <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="pl-8 pr-7 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
        </div>
        <span className={cn("mt-1 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded", roleMeta.color)}>
          {roleMeta.label}
        </span>
      </td>

      {/* Company */}
      <td className="px-5 py-3">
        <div className="relative inline-block">
          <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <select
            disabled={role === "superadmin"}
            value={companyId || ""}
            onChange={(e) => setCompanyId(e.target.value || null)}
            className={cn(
              "pl-8 pr-7 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer appearance-none",
              role === "superadmin" && "opacity-50 cursor-not-allowed"
            )}
          >
            <option value="">No Company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
        </div>
      </td>

      {/* Reset password */}
      <td className="px-5 py-3">
        <button
          type="button"
          onClick={onResetPassword}
          className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          <KeyRound className="size-3" />
          Reset
        </button>
      </td>

      {/* Save */}
      <td className="px-5 py-3 text-right">
        <button
          disabled={isLoading || !hasChanges}
          onClick={() => onUpdate(user.id, role, companyId)}
          className={cn(
            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-auto transition-all active:scale-95",
            hasChanges && !isLoading
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:bg-indigo-700 dark:hover:bg-slate-200"
              : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
          )}
        >
          {isLoading ? <Loader2 className="animate-spin size-3" /> : <Check className="size-3" />}
          {hasChanges ? "Save" : "Saved"}
        </button>
        {user.updated_at && (
          <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider pr-1">
            {new Date(user.updated_at).toLocaleDateString()}
          </p>
        )}
      </td>
    </tr>
  );
}

// ─── UserCard (mobile) ────────────────────────────────────────────────────────
function UserCard({
  user,
  companies,
  onUpdate,
  onResetPassword,
  isLoading,
}: {
  user: User;
  companies: Company[];
  onUpdate: (userId: string, role: string, companyId: string | null) => void;
  onResetPassword: () => void;
  isLoading: boolean;
}) {
  const [role, setRole] = useState(user.role || "sales_agent");
  const [companyId, setCompanyId] = useState<string | null>(user.company_id);
  const hasChanges = role !== user.role || companyId !== user.company_id;
  const roleMeta = getRoleMeta(role);

  return (
    <div className="p-4 space-y-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black text-white relative shrink-0">
          {(user.full_name ?? "U").substring(0, 2).toUpperCase()}
          {isLoading && (
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Loader2 className="size-4 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 dark:text-white truncate">
            {user.full_name || "Unknown"}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Mail className="size-3 shrink-0" />
            <span className="truncate">{user.email_address}</span>
          </div>
        </div>
        <span className={cn("text-[9px] font-bold px-2 py-1 rounded-lg", roleMeta.color)}>
          {roleMeta.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full pl-8 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <select
            disabled={role === "superadmin"}
            value={companyId || ""}
            onChange={(e) => setCompanyId(e.target.value || null)}
            className={cn(
              "w-full pl-8 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none",
              role === "superadmin" && "opacity-50 cursor-not-allowed"
            )}
          >
            <option value="">No Company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onResetPassword}
          className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          <KeyRound className="size-3" />
          Reset password
        </button>
        <button
          disabled={isLoading || !hasChanges}
          onClick={() => onUpdate(user.id, role, companyId)}
          className={cn(
            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
            hasChanges && !isLoading
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
              : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
          )}
        >
          {isLoading ? <Loader2 className="animate-spin size-3" /> : <Check className="size-3" />}
          {hasChanges ? "Save" : "Saved"}
        </button>
      </div>
    </div>
  );
}
