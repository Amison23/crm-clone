"use client";

import { useState, useEffect } from "react";
import { SuperAdmin } from "@/components/admins/super-admin";
import { CompanyAdmin } from "@/components/admins/admin";
import { AgentDashboard } from "@/components/admins/agent-admin";

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

  // Only show tabs the user's role is allowed to see
  const visibleTabs = ALL_TABS.filter((t) => (t.roles as readonly string[]).includes(actualRole));

  // Default to the tab that matches the user's role, fallback to first visible
  const defaultTab =
    (visibleTabs.find((t) => t.key === actualRole)?.key ?? visibleTabs[0]?.key) as TabKey;

  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  // When role changes, we might need to switch to a valid tab for that role
  useEffect(() => {
    if (!visibleTabs.find(t => t.key === activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [actualRole, visibleTabs, activeTab, defaultTab]);

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
      </div>

      {/* ── PANELS ── */}
      {activeTab === "superadmin" && (
        <SuperAdmin user={user} />
      )}

      {activeTab === "admin" && (
        <CompanyAdmin companyId={user?.company_id} initialCompany={company} />
      )}

      {activeTab === "sales_agent" && (
        <AgentDashboard userId={user?.id} companyId={user?.company_id} />
      )}
    </div>
  );
}