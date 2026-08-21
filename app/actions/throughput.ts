"use server";

import { createClient } from "@/lib/supabase/server";

export interface ThroughputMetrics {
  primaryLabel: string;
  primaryValue: number;
  primaryColor: string;
  secondaryLabel: string;
  secondaryValue: number;
  secondaryColor: string;
}

export async function getThroughputMetrics(): Promise<{ success: boolean; metrics?: ThroughputMetrics; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { data: employee } = await supabase
      .from("employees")
      .select("id, role, company_id")
      .eq("id", user.id)
      .single();

    if (!employee) return { success: false, error: "No employee profile found" };

    const companyId = employee.company_id;
    const role = employee.role;

    if (role === "admin" || role === "superadmin") {
      // 1. Admin Level: Org Team Objectives & SLA Compliance
      let leadsQuery = supabase.from("leads").select("id, status");
      let tasksQuery = supabase.from("tasks").select("id, status");
      let ticketsQuery = supabase.from("tickets").select("id, status");

      if (companyId && role === "admin") {
        leadsQuery = leadsQuery.eq("company_id", companyId);
        tasksQuery = tasksQuery.eq("company_id", companyId);
        ticketsQuery = ticketsQuery.eq("company_id", companyId);
      }

      const [leadsRes, tasksRes, ticketsRes] = await Promise.all([
        leadsQuery,
        tasksQuery,
        ticketsQuery
      ]);

      const leads = leadsRes.data || [];
      const tasks = tasksRes.data || [];
      const tickets = ticketsRes.data || [];

      // Team Objectives: Won Leads / Total Leads
      const totalLeads = leads.length;
      const wonLeads = leads.filter((l) => l.status?.toLowerCase() === "won").length;
      const teamObjectivesVal = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

      // SLA Compliance: Completed Tasks & Closed Tickets / Total Work Items
      const totalWorkItems = tasks.length + tickets.length;
      const completedWorkItems = 
        tasks.filter((t) => t.status?.toLowerCase() === "completed" || t.status?.toLowerCase() === "done").length +
        tickets.filter((t) => t.status?.toLowerCase() === "closed" || t.status?.toLowerCase() === "resolved").length;

      const slaComplianceVal = totalWorkItems > 0 ? Math.round((completedWorkItems / totalWorkItems) * 100) : 100;

      return {
        success: true,
        metrics: {
          primaryLabel: "Team Objectives",
          primaryValue: teamObjectivesVal,
          primaryColor: "bg-indigo-500",
          secondaryLabel: "SLA Compliance",
          secondaryValue: slaComplianceVal,
          secondaryColor: "bg-blue-500",
        }
      };
    } else {
      // 2. Agent / Server Admin / Dev Level: Personal outreach & task follow-up
      const [assignedTasksRes, assignedLeadsRes] = await Promise.all([
        supabase.from("tasks").select("id, status").eq("assigned_to", user.id),
        supabase.from("leads").select("id, status").eq("employee_id", user.id)
      ]);

      const tasks = assignedTasksRes.data || [];
      const leads = assignedLeadsRes.data || [];

      // Outreach: Task completion rate for this specific agent
      const totalAgentTasks = tasks.length;
      const completedAgentTasks = tasks.filter((t) => t.status?.toLowerCase() === "completed" || t.status?.toLowerCase() === "done").length;
      const outreachVal = totalAgentTasks > 0 ? Math.round((completedAgentTasks / totalAgentTasks) * 100) : 0;

      // Lead Follow-up: Engaged (contacted/won/qualified) vs total assigned leads
      const totalAgentLeads = leads.length;
      const engagedAgentLeads = leads.filter((l) => 
        ["won", "contacted", "qualified", "in_progress"].includes(l.status?.toLowerCase())
      ).length;
      const followUpVal = totalAgentLeads > 0 ? Math.round((engagedAgentLeads / totalAgentLeads) * 100) : 0;

      return {
        success: true,
        metrics: {
          primaryLabel: role === "dev" ? "Dev Sprint Tasks" : "Daily Outreach",
          primaryValue: outreachVal,
          primaryColor: "bg-indigo-500",
          secondaryLabel: role === "dev" ? "Issue Resolution" : "Lead Follow-up",
          secondaryValue: followUpVal,
          secondaryColor: "bg-amber-500",
        }
      };
    }
  } catch (err: any) {
    console.error("Error fetching throughput metrics:", err);
    return { success: false, error: err.message };
  }
}
