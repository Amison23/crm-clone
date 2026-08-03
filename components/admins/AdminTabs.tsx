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

export default function AdminTabs({ user, company }: AdminTabsProps) {
  const actualRole = user?.role ?? "";

  return (
    <div className="space-y-6">
      {actualRole === "superadmin" && (
        <SuperAdmin user={user} />
      )}

      {actualRole === "admin" && (
        <CompanyAdmin companyId={user?.company_id} initialCompany={company} />
      )}

      {actualRole === "sales_agent" && (
        <AgentDashboard userId={user?.id} companyId={user?.company_id} />
      )}
    </div>
  );
}