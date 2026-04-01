"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * INTELLIGENCE ENGINE v3.0 - TASK PROTOCOLS
 * High-performance task orchestration with Cross-Node Revalidation.
 */

export async function getTasks() {
  const supabase = await createClient();

  // 1. IDENTITY & METADATA EXTRACTION
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenant_id;

  if (!tenantId) return { error: "Node Access Denied: Null Tenant Context" };

  // 2. TACTICAL FETCH
  // Logic: Optimized join to retrieve assignee details for the Task Board
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*, assignee:employees!tasks_assigned_to_fkey(full_name, email_address)")
    .eq("company_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) return { error: `Query Failure: ${error.message}` };

  return { tasks };
}

export async function createTaskAction(formData: FormData) {
  const supabase = await createClient();

  // 1. SECURITY VALIDATION
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenant_id;

  if (!user || !tenantId) return { error: "Unauthorized Node Access" };

  // 2. DATA EXTRACTION
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const status = (formData.get("status") as string) || "pending";
  const priority = (formData.get("priority") as string) || "medium";
  const due_date = formData.get("due_date") as string;

  if (!title) return { error: "HCI Requirement: Task Title is mandatory." };

  // 3. PERSISTENCE
  const { error } = await supabase.from("tasks").insert([
    {
      company_id: tenantId,
      assigned_to: user.id, // Auto-assign to creator for initial node state
      title,
      description,
      status,
      priority,
      due_date: due_date ? new Date(due_date).toISOString() : null,
    },
  ]);

  if (error) return { error: `Insertion Failure: ${error.message}` };

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