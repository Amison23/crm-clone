"use client";

import { useState } from "react";
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

export default function AdminTabs({ user, company }: AdminTabsProps) {
  const role = user?.role ?? "";
  const [activeTab, setActiveTab] = useState<string>(role);

  return (
    <div>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {role === "superadmin" && (
            <button
              onClick={() => setActiveTab("superadmin")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "superadmin"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              Super Admin
            </button>
          )}
          {(role === "superadmin" || role === "admin") && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "admin"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              Company Admin
            </button>
          )}
          <button
            onClick={() => setActiveTab("sales_agent")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "sales_agent" || activeTab === "agent-admin"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            Agent Console
          </button>
        </div>

      {activeTab === "superadmin" && <SuperAdmin user={user} />}
      {activeTab === "admin" && <CompanyAdmin companyId={user?.company_id} initialCompany={company} />}
      {(activeTab === "sales_agent" || activeTab === "agent-admin") && (
        <AgentDashboard userId={user?.id} companyId={user?.company_id} />
      )}
    </div>
  );
}
