"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTaskAction } from "@/lib/api/tasks";
import { Loader2 } from "lucide-react";

export function AddTaskForm({ 
  onSuccess,
  onMessage,
  agents,
  isAdmin
}: { 
  onSuccess?: () => void,
  onMessage?: (type: "success" | "error", msg: string) => void,
  agents?: any[],
  isAdmin?: boolean
}) {
  const [isPending, setIsPending] = useState(false);
  const isSubmitting = useRef(false);

  async function onSubmit(formData: FormData) {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsPending(true);
    try {
      const result = await createTaskAction(formData);
      if (result.error) {
        onMessage?.("error", result.error);
      } else {
        onMessage?.("success", "Task added successfully!");
        onSuccess?.();
      }
    } catch (error: any) {
      onMessage?.("error", error.message || "An error occurred");
    } finally {
      setIsPending(false);
      isSubmitting.current = false;
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" required placeholder="Task title" />
      </div>

      {isAdmin && agents && agents.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Assign To</Label>
          <select id="assigned_to" name="assigned_to" className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm">
            <option value="">Assign to myself</option>
            {agents?.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.full_name || a.email_address} ({a.email_address}{a.role ? ` · ${a.role.replace('_', ' ')}` : ''})
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="Short description" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date *</Label>
          <Input id="due_date" name="due_date" type="datetime-local" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm">
            <option value="pending">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select id="priority" name="priority" className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2 border-t mt-6">
        <Button disabled={isPending} className="w-full sm:w-auto">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Task
        </Button>
      </div>
    </form>
  );
}
