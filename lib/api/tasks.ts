"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * INTELLIGENCE ENGINE v3.0 - TASK PROTOCOLS
 * High-performance task orchestration with Cross-Node Revalidation & Audit Telemetry.
 */

export type TaskRelation = "mine" | "assigned_by_me" | "team";

export async function isTaskOverdue(dueDate: string | null | undefined, status: string): Promise<boolean> {
  if (!dueDate || status === "completed") return false;
  return new Date(dueDate).getTime() < Date.now();
}

/**
 * Helper to perform explicit authorization checks for task mutations.
 * Verification logic: User must be assigned_to OR created_by OR have admin/superadmin role.
 */
async function checkTaskAuth(supabase: any, userId: string, taskId: string) {
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, company_id, assigned_to, created_by")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    return { authorized: false, error: "Task Not Found: Invalid Task ID" };
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", userId)
    .single();

  if (!employee || employee.company_id !== task.company_id) {
    return { authorized: false, error: "Security Violation: Cross-Tenant Access Denied" };
  }

  const isAssigned = task.assigned_to === userId;
  const isCreator = task.created_by === userId;
  const isAdmin = employee.role === "admin" || employee.role === "superadmin";

  if (!isAssigned && !isCreator && !isAdmin) {
    return { authorized: false, error: "Access Denied: Insufficient permissions to modify or delete this task" };
  }

  return { authorized: true, task, employee };
}

export async function getTasks() {
  const supabase = await createClient();

  // 1. IDENTITY & TENANT RESOLUTION
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
  let query = supabase
    .from("tasks")
    .select("*, assignee:employees!tasks_assigned_to_fkey(full_name, email_address)")
    .eq("company_id", tenantId)
    .is("archived_at", null)
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
      .select("id, full_name, email_address, role")
      .eq("company_id", tenantId);
    if (agentsData) agents = agentsData;
  }

  // 3. RELATION TAGGING & OVERDUE EVALUATION
  const finalTasks = (tasks ?? []).map((t: any) => {
    let relation: TaskRelation = "team";
    if (t.assigned_to === user.id) {
      relation = "mine";
    } else if (t.created_by === user.id) {
      relation = "assigned_by_me";
    } else {
      relation = "team";
    }

    return {
      ...t,
      relation,
      is_overdue: isTaskOverdue(t.due_date, t.status),
    };
  });

  return { tasks: finalTasks, agents, isAdmin, userId: user.id };
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

  // 3. PERSISTENCE (Explicitly storing created_by = user.id)
  const { data: newTask, error } = await supabase.from("tasks").insert([
    {
      company_id: tenantId,
      assigned_to: assignedTo,
      created_by: user.id,
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
    payload: { title, assigned_to: assignedTo, created_by: user.id, status, priority }
  });

  // 4. CROSS-NODE REVALIDATION
  triggerGlobalRevalidation();

  return { success: true };
}

export async function updateTaskStatusAction(taskId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Node Auth Required" };

  // EXPLICIT AUTHORIZATION CHECK
  const authRes = await checkTaskAuth(supabase, user.id, taskId);
  if (!authRes.authorized) return { error: authRes.error };

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

  // EXPLICIT AUTHORIZATION CHECK
  const authRes = await checkTaskAuth(supabase, user.id, taskId);
  if (!authRes.authorized) return { error: authRes.error };

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "DELETE_TASK",
    entity_type: "task",
    entity_id: taskId,
    payload: { taskId }
  });

  triggerGlobalRevalidation();
  return { success: true };
}

export async function getTaskFeedback(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Node Auth Required" };

  const { data: feedback, error } = await supabase
    .from("task_feedback")
    .select("*, author:employees!task_feedback_author_id_fkey(full_name, email_address, role)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) return { error: error.message };
  return { feedback: feedback ?? [] };
}

export async function addTaskFeedback(taskId: string, message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Node Auth Required" };

  if (!message || !message.trim()) {
    return { error: "Feedback message cannot be empty." };
  }

  const { data: newFeedback, error } = await supabase
    .from("task_feedback")
    .insert([
      {
        task_id: taskId,
        author_id: user.id,
        message: message.trim(),
      },
    ])
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "ADD_TASK_FEEDBACK",
    entity_type: "task",
    entity_id: taskId,
    payload: { feedback_id: newFeedback?.id, message: message.trim() }
  });

  triggerGlobalRevalidation();
  return { success: true };
}

export async function getArchivedTasks() {
  const supabase = await createClient();
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

  let query = supabase
    .from("tasks")
    .select("*, assignee:employees!tasks_assigned_to_fkey(full_name, email_address)")
    .eq("company_id", tenantId)
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false });

  if (role === "sales_agent" || role === "server_admin" || role === "dev") {
    query = query.eq("assigned_to", user.id);
  }

  const { data: tasks, error } = await query;
  if (error) return { error: `Query Failure: ${error.message}` };

  const finalTasks = (tasks ?? []).map((t: any) => {
    let relation: TaskRelation = "team";
    if (t.assigned_to === user.id) relation = "mine";
    else if (t.created_by === user.id) relation = "assigned_by_me";

    return {
      ...t,
      relation,
      is_overdue: false, // Archived tasks are not flagged active overdue
    };
  });

  return { tasks: finalTasks, isAdmin: role === "admin" || role === "superadmin", userId: user.id };
}

export async function archiveTaskAction(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Node Auth Required" };

  const authRes = await checkTaskAuth(supabase, user.id, taskId);
  if (!authRes.authorized) return { error: authRes.error };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("tasks")
    .update({ archived_at: now, archived_by: user.id })
    .eq("id", taskId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "ARCHIVE_TASK",
    entity_type: "task",
    entity_id: taskId,
    payload: { taskId, archived_at: now }
  });

  triggerGlobalRevalidation();
  return { success: true };
}

export async function unarchiveTaskAction(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Node Auth Required" };

  const authRes = await checkTaskAuth(supabase, user.id, taskId);
  if (!authRes.authorized) return { error: authRes.error };

  const { error } = await supabase
    .from("tasks")
    .update({ archived_at: null, archived_by: null })
    .eq("id", taskId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "UNARCHIVE_TASK",
    entity_type: "task",
    entity_id: taskId,
    payload: { taskId }
  });

  triggerGlobalRevalidation();
  return { success: true };
}

export async function bulkArchiveTasksAction(taskIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Node Auth Required" };

  if (!taskIds || taskIds.length === 0) {
    return { success: true, archivedCount: 0, skippedIds: [] };
  }

  let archivedCount = 0;
  const skippedIds: string[] = [];
  const now = new Date().toISOString();

  for (const taskId of taskIds) {
    const authRes = await checkTaskAuth(supabase, user.id, taskId);
    if (!authRes.authorized) {
      skippedIds.push(taskId);
      continue;
    }

    const { error } = await supabase
      .from("tasks")
      .update({ archived_at: now, archived_by: user.id })
      .eq("id", taskId);

    if (error) {
      skippedIds.push(taskId);
    } else {
      archivedCount++;
      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        action: "ARCHIVE_TASK",
        entity_type: "task",
        entity_id: taskId,
        payload: { taskId, archived_at: now, bulk: true }
      });
    }
  }

  triggerGlobalRevalidation();
  return { success: true, archivedCount, skippedIds };
}

/**
 * ⚡ Private Helper: Broadcasts data changes to all relevant UI nodes
 */
function triggerGlobalRevalidation() {
  revalidatePath("/protected/task-management-board");
  revalidatePath("/protected/analytics-and-reporting");
  revalidatePath("/protected/executive-dashboard");
}