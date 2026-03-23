"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTasks() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not logged in" };

  // Fetch the user's employee profile
  const { data: employee } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!employee?.company_id) return { error: "No company found. Please contact support." };

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*, assignee:employees!tasks_assigned_to_fkey(full_name, email_address)")
    .eq("company_id", employee.company_id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  return { tasks };
}

export async function createTaskAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: employee } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!employee?.company_id) return { error: "No company found" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string || "pending";
  const priority = formData.get("priority") as string || "medium";
  const due_date = formData.get("due_date") as string;

  if (!title) return { error: "Title is required" };

  const { error } = await supabase.from("tasks").insert([
    {
      company_id: employee.company_id,
      assigned_to: user.id,
      title,
      description,
      status,
      priority,
      due_date: due_date ? new Date(due_date).toISOString() : null
    }
  ]);

  if (error) return { error: error.message };

  revalidatePath("/protected/task-management-board");
  return { success: true };
}

export async function updateTaskStatusAction(taskId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) return { error: error.message };

  revalidatePath("/protected/task-management-board");
  return { success: true };
}

export async function deleteTaskAction(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return { error: error.message };

  revalidatePath("/protected/task-management-board");
  return { success: true };
}
