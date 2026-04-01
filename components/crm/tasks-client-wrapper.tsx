"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { AddTaskForm } from "./add-task-form";
import { updateTaskStatusAction, deleteTaskAction } from "@/lib/api/tasks";
import toast from "react-hot-toast";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  assignee?: { full_name: string | null, email_address: string | null } | null;
};

export function TasksClientWrapper({ initialTasks }: { initialTasks: Task[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const showToast = (type: "success" | "error", text: string) => {
    if (type === "success") toast.success(text);
    else toast.error(text);
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    const res = await updateTaskStatusAction(taskId, newStatus);
    if (res.error) showToast("error", res.error);
    else showToast("success", "Task updated!");
  };

  const deleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      const res = await deleteTaskAction(taskId);
      if (res.error) showToast("error", res.error);
      else showToast("success", "Task deleted!");
    }
  };

  const columns = [
    { id: "pending", title: "To Do", tasks: initialTasks.filter(t => t.status === "pending") },
    { id: "in_progress", title: "In Progress", tasks: initialTasks.filter(t => t.status === "in_progress") },
    { id: "review", title: "Review", tasks: initialTasks.filter(t => t.status === "review") },
    { id: "completed", title: "Completed", tasks: initialTasks.filter(t => t.status === "completed") }
  ];

  return (
    <>
      <div className="flex h-screen overflow-hidden relative">
        <div className="w-full flex-1 relative flex flex-col">

          <div className="flex-1 overflow-x-auto p-8 scrollbar-hide">
            <div className="flex gap-6 h-full min-w-max">
              {columns.map(col => (
                <div key={col.id} className="w-80 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">{col.title}</h3>
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-bold">{col.tasks.length}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {col.tasks.map(task => (
                      <div key={task.id} className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary transition-all group ${task.status === "completed" ? "opacity-75" : ""}`}>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            task.priority === "high" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                            task.priority === "medium" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {task.priority || "Medium"}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => updateStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')} className="text-slate-400 hover:text-primary">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-500">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                        <h4 className={`text-sm font-semibold mb-4 line-clamp-2 ${task.status === "completed" ? "line-through text-slate-500" : ""}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : new Date(task.created_at).toLocaleDateString()}</span>
                          </div>
                          {task.assignee?.full_name ? (
                            <div className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {task.assignee.full_name}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-xl z-40"
          >
            <Plus className="h-6 w-6" />
          </Button>

          {isOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative mx-auto my-8">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Add New Task</h2>
                  <p className="text-sm text-slate-500 mt-1">Create a new task to track progress.</p>
                </div>
                <AddTaskForm 
                  onSuccess={() => setIsOpen(false)} 
                  onMessage={showToast}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
