"use client";

import { useState, useEffect } from "react";
import { SuperAdmin } from "@/components/admins/super-admin";
import { CompanyAdmin } from "@/components/admins/admin";
import { AgentDashboard } from "@/components/admins/agent-admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminTabsProps {
  user: {
    id: string;
    role: string;
    company_id: string | null;
  } | null;
  company?: any;
}

// All possible tabs in display order
const ALL_TABS = [
  { key: "superadmin", label: "Super admin",   roles: ["superadmin"] },
  { key: "admin",      label: "Company admin", roles: ["superadmin", "admin"] },
  { key: "sales_agent",label: "Agent console", roles: ["superadmin", "admin", "sales_agent", "server_admin"] },
] as const;

type TabKey = (typeof ALL_TABS)[number]["key"];

export default function AdminTabs({ user, company }: AdminTabsProps) {
  const actualRole = user?.role ?? "";
  const [activeRole, setActiveRole] = useState(actualRole);

  // Sync activeRole if the prop changes (initial load)
  useEffect(() => {
    setActiveRole(actualRole);
  }, [actualRole]);

  // Only show tabs the simulated role is allowed to see
  const visibleTabs = ALL_TABS.filter((t) => (t.roles as readonly string[]).includes(activeRole));

  // Default to the tab that matches the simulated role, fallback to first visible
  const defaultTab =
    (visibleTabs.find((t) => t.key === activeRole)?.key ?? visibleTabs[0]?.key) as TabKey;

  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  // When role changes, we might need to switch to a valid tab for that role
  useEffect(() => {
    if (!visibleTabs.find(t => t.key === activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [activeRole, visibleTabs, activeTab, defaultTab]);

  // Create a simulated user object to pass to sub-components
  const simulatedUser = user ? { ...user, role: activeRole } : null;

  return (
    <div className="space-y-6">

      {/* ── TAB BAR ── */}
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab.key
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }
            `}
          >
            {tab.label}
          </button>
        ))}

        {/* Testing / Role Override UI */}
        <div className="ml-4 flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            View As:
          </span>
          <Select value={activeRole} onValueChange={setActiveRole}>
            <SelectTrigger className="h-7 w-[130px] text-xs bg-transparent border-none focus:ring-0 px-1 font-medium text-slate-700 dark:text-slate-300">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="superadmin">Super Admin</SelectItem>
              <SelectItem value="admin">Company Admin</SelectItem>
              <SelectItem value="sales_agent">Sales Agent</SelectItem>
              <SelectItem value="server_admin">Server Admin</SelectItem>
            </SelectContent>
          </Select>
          <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-amber-500 rounded uppercase">
            Dev
          </span>
        </div>
      </div>

      {/* ── PANELS ── */}
      {activeTab === "superadmin" && (
        <SuperAdmin user={simulatedUser} />
      )}

      {activeTab === "admin" && (
        <CompanyAdmin companyId={simulatedUser?.company_id} initialCompany={company} />
      )}

      {activeTab === "sales_agent" && (
        <AgentDashboard userId={simulatedUser?.id} companyId={simulatedUser?.company_id} />
      )}
    </div>
  );
}