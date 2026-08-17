"use server";

import { createClient } from "@/lib/supabase/server";

export async function recordWorkerHeartbeat(idleSeconds: number, isMouseActive: boolean) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", user.id)
      .single();

    if (!employee || !employee.company_id) {
      return { success: false, error: "Null company context" };
    }

    const status = idleSeconds > 120 ? "idle" : "active";

    // Insert new activity log snapshot
    const { error } = await supabase
      .from("worker_activity_logs")
      .insert({
        company_id: employee.company_id,
        employee_id: employee.id,
        status,
        idle_seconds: idleSeconds,
        last_mouse_activity: isMouseActive ? new Date().toISOString() : undefined,
        recorded_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Heartbeat error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, status };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getWorkerActivityLogs(companyId?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { data: employee } = await supabase
      .from("employees")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (!employee) return { success: false, error: "Unauthorized" };

    const targetCompanyId = employee.role === "superadmin" ? (companyId || employee.company_id) : employee.company_id;

    if (!targetCompanyId) return { success: false, error: "No company context" };

    // Fetch latest activity log entry per worker
    const { data: logs, error } = await supabase
      .from("worker_activity_logs")
      .select(`
        id,
        employee_id,
        status,
        idle_seconds,
        last_mouse_activity,
        recorded_at,
        employees ( full_name, role, email_address )
      `)
      .eq("company_id", targetCompanyId)
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (error) return { success: false, error: error.message };

    // Deduplicate by employee_id to show latest state per agent
    const latestPerEmployee = new Map();
    logs?.forEach(log => {
      if (!latestPerEmployee.has(log.employee_id)) {
        latestPerEmployee.set(log.employee_id, log);
      }
    });

    return {
      success: true,
      logs: Array.from(latestPerEmployee.values()),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
