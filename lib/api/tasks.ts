"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * INTELLIGENCE ENGINE v3.0 - TASK PROTOCOLS
 * High-performance task orchestration with Cross-Node Revalidation.
 */

export async function getTasks() {
  const supabase = await createClient();

  // 1. IDENTITY & TENANT RESOLUTION
  // tenant_id is not baked into the JWT — resolve company_id from the employees table
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Node Access Denied: Authentication Required" };

  const { data: employee } = await supabase
    .from("employees")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  const tenantId = employee?.company_id;
  const role = employee?.role;
  if (!tenantId) return { error: "Node Access Denied: Null Tenant Context" };

  // 2. TACTICAL FETCH
  // Logic: Optimized join to retrieve assignee details for the Task Board
  let query = supabase
    .from("tasks")
    .select("*, assignee:employees!tasks_assigned_to_fkey(full_name, email_address)")
    .eq("company_id", tenantId)
    .order("created_at", { ascending: false });

  if (role === "sales_agent" || role === "server_admin" || role === "dev") {
    query = query.eq("assigned_to", user.id);
  }

  const { data: tasks, error } = await query;

  if (error) return { error: `Query Failure: ${error.message}` };

  // 2.5 FETCH AGENTS FOR ASSIGNMENT
  let agents: any[] = [];
  const isAdmin = role === "admin" || role === "superadmin";

  if (isAdmin) {
    const { data: agentsData } = await supabase
      .from("employees")
      .select("id, full_name, email_address")
      .eq("company_id", tenantId);
    if (agentsData) agents = agentsData;
  }

  const finalTasks = tasks ?? [];

  return { tasks: finalTasks, agents, isAdmin };
}

export async function createTaskAction(formData: FormData) {
  const supabase = await createClient();

  // 1. SECURITY & TENANT VALIDATION
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized Node Access" };

  const { data: employee } = await supabase
    .from("employees")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  const tenantId = employee?.company_id;
  const role = employee?.role;
  if (!tenantId) return { error: "Security Violation: Null Tenant Context" };

  // 2. DATA EXTRACTION
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const status = (formData.get("status") as string) || "pending";
  const priority = (formData.get("priority") as string) || "medium";
  const due_date = formData.get("due_date") as string;

  if (!title) return { error: "HCI Requirement: Task Title is mandatory." };

  const requestedAssignee = formData.get("assigned_to") as string;
  let assignedTo = user.id;

  if ((role === "admin" || role === "superadmin") && requestedAssignee) {
    assignedTo = requestedAssignee;
  }

  // 3. PERSISTENCE
  const { data: newTask, error } = await supabase.from("tasks").insert([
    {
      company_id: tenantId,
      assigned_to: assignedTo,
      title,
      description,
      status,
      priority,
      due_date: due_date ? new Date(due_date).toISOString() : null,
    },
  ]).select("id").single();

  if (error) return { error: `Insertion Failure: ${error.message}` };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "CREATE_TASK",
    entity_type: "task",
    entity_id: newTask?.id || "task",
    payload: { title, assigned_to: assignedTo, status, priority }
  });

  // 4. CROSS-NODE REVALIDATION
  // Updates the Task Board, Analytics Engine, and Executive Command Center
  triggerGlobalRevalidation();

  return { success: true };
}

export async function updateTaskStatusAction(taskId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Node Auth Required" };

  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "UPDATE_TASK_STATUS",
    entity_type: "task",
    entity_id: taskId,
    payload: { status }
  });

  triggerGlobalRevalidation();
  return { success: true };
}

export async function deleteTaskAction(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Node Auth Required" };

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) return { error: error.message };

  triggerGlobalRevalidation();
  return { success: true };
}

/**
 * ⚡ Private Helper: Broadcasts data changes to all relevant UI nodes
 */
function triggerGlobalRevalidation() {
  revalidatePath("/protected/task-management-board");
  revalidatePath("/protected/analytics-and-reporting");
  revalidatePath("/protected/executive-dashboard");
}