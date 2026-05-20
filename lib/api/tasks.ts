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
    .select("company_id")
    .eq("id", user.id)
    .single();

  const tenantId = employee?.company_id;
  if (!tenantId) return { error: "Node Access Denied: Null Tenant Context" };

  // 2. TACTICAL FETCH
  // Logic: Optimized join to retrieve assignee details for the Task Board
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*, assignee:employees!tasks_assigned_to_fkey(full_name, email_address)")
    .eq("company_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) return { error: `Query Failure: ${error.message}` };

  // 3. MOCK DATA FALLBACK (For Presentation/Empty State)
  const finalTasks = (tasks && tasks.length > 0) ? tasks : [
    {
      id: "t1",
      title: "Deploy CRM Node v2.5",
      description: "Finalize the production deployment of the af-south-1 node.",
      status: "in_progress",
      priority: "high",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      due_date: new Date(Date.now() + 86400000).toISOString(),
      assignee: { full_name: "System Automator", email_address: "bot@crm.node" }
    },
    {
      id: "t2",
      title: "Quarterly Performance Review",
      description: "Analyze lead conversion metrics and agent response times.",
      status: "pending",
      priority: "medium",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      due_date: new Date(Date.now() + 259200000).toISOString(),
      assignee: { full_name: "Jason Anyango", email_address: "jason@momentum.test" }
    },
    {
      id: "t3",
      title: "Security Patch: ACL Layer",
      description: "Address the identified vulnerability in the role-based permission matrix.",
      status: "completed",
      priority: "critical",
      created_at: new Date(Date.now() - 259200000).toISOString(),
      due_date: new Date(Date.now() - 86400000).toISOString(),
      assignee: { full_name: "Elena Rodriguez", email_address: "elena@tech.node" }
    }
  ];

  return { tasks: finalTasks };
}

export async function createTaskAction(formData: FormData) {
  const supabase = await createClient();

  // 1. SECURITY & TENANT VALIDATION
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized Node Access" };

  const { data: employee } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", user.id)
    .single();

  const tenantId = employee?.company_id;
  if (!tenantId) return { error: "Security Violation: Null Tenant Context" };

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