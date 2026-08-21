"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Calendar, MessageSquare, AlertCircle, Trash2, CheckCircle2, Eye, X, Archive, RotateCcw } from "lucide-react";
import {
  updateTaskStatusAction,
  deleteTaskAction,
  getTaskFeedback,
  addTaskFeedback,
  archiveTaskAction,
  unarchiveTaskAction,
  bulkArchiveTasksAction,
  getArchivedTasks,
} from "@/lib/api/tasks";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  created_by?: string | null;
  assigned_to?: string | null;
  relation?: "mine" | "assigned_by_me" | "team";
  is_overdue?: boolean;
  archived_at?: string | null;
  archived_by?: string | null;
  assignee?: { full_name: string | null; email_address: string | null } | null;
};

export function TasksClientWrapper({
  initialTasks = [],
  agents = [],
  isAdmin = false,
  userId = "",
}: {
  initialTasks: Task[];
  agents?: any[];
  isAdmin?: boolean;
  userId?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // View & Tab State ('mine' | 'assigned_by_me' | 'team' | 'archived')
  const [activeTab, setActiveTab] = useState<"mine" | "assigned_by_me" | "team" | "archived">("mine");
  const [showArchivedView, setShowArchivedView] = useState(false);

  // Bulk Selection State
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkArchiving, setBulkArchiving] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");

  // Feedback State for Detail Drawer
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Load archived tasks when switching to archived tab
  useEffect(() => {
    if (activeTab === "archived" || showArchivedView) {
      loadArchivedTasks();
    }
  }, [activeTab, showArchivedView]);

  const loadArchivedTasks = async () => {
    setLoadingArchived(true);
    const res = await getArchivedTasks();
    if (res.tasks) {
      setArchivedTasks(res.tasks);
    }
    setLoadingArchived(false);
  };

  const showToast = (type: "success" | "error", text: string) => {
    if (type === "success") toast.success(text);
    else toast.error(text);
  };

  const isOverdue = (task: Task) => {
    if (task.archived_at || !task.due_date || task.status === "completed") return false;
    return new Date(task.due_date).getTime() < Date.now();
  };

  const isArchivedTab = activeTab === "archived" || showArchivedView;

  // Active Task Stats (Excludes Archived Tasks)
  const activeTasks = tasks.filter((t) => !t.archived_at);
  const stats = {
    pending: activeTasks.filter((t) => t.status === "pending").length,
    in_progress: activeTasks.filter((t) => t.status === "in_progress").length,
    review: activeTasks.filter((t) => t.status === "review").length,
    completed: activeTasks.filter((t) => t.status === "completed").length,
    overdue: activeTasks.filter((t) => isOverdue(t)).length,
  };

  // Tab Counts for Admins
  const tabCounts = {
    mine: activeTasks.filter((t) => t.relation === "mine" || t.assigned_to === userId).length,
    assigned_by_me: activeTasks.filter((t) => t.relation === "assigned_by_me" || t.created_by === userId).length,
    team: activeTasks.length,
    archived: archivedTasks.length,
  };

  // Current Dataset to Render
  const currentDataset = isArchivedTab ? archivedTasks : activeTasks;

  // Filter Logic
  const filteredTasks = currentDataset.filter((task) => {
    if (!isArchivedTab && isAdmin) {
      if (activeTab === "mine" && !(task.relation === "mine" || task.assigned_to === userId)) return false;
      if (activeTab === "assigned_by_me" && !(task.relation === "assigned_by_me" || task.created_by === userId)) return false;
    }

    const matchStatus = statusFilter === "All" || task.status === statusFilter;
    const matchPriority = priorityFilter === "All" || task.priority === priorityFilter;
    const matchAgent = agentFilter === "All" || task.assigned_to === agentFilter;

    return matchStatus && matchPriority && matchAgent;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectOne = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    const res = await updateTaskStatusAction(taskId, newStatus);
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast("success", "Task status updated!");
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      router.refresh();
    }
  };

  const archiveTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to archive this task?")) return;
    const res = await archiveTaskAction(taskId);
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast("success", "Task archived!");
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId));
      loadArchivedTasks();
      router.refresh();
    }
  };

  const unarchiveTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to restore/unarchive this task?")) return;
    const res = await unarchiveTaskAction(taskId);
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast("success", "Task unarchived!");
      setArchivedTasks((prev) => prev.filter((t) => t.id !== taskId));
      router.refresh();
    }
  };

  const handleBulkArchive = async () => {
    if (selectedTaskIds.length === 0) return;
    if (!confirm(`Are you sure you want to archive ${selectedTaskIds.length} selected task(s)?`)) return;
    setBulkArchiving(true);

    const res = await bulkArchiveTasksAction(selectedTaskIds);
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast(
        "success",
        `Archived ${res.archivedCount} task(s). ${res.skippedIds.length > 0 ? `${res.skippedIds.length} skipped (unauthorized).` : ""}`
      );
      setTasks((prev) => prev.filter((t) => !selectedTaskIds.includes(t.id) || res.skippedIds.includes(t.id)));
      setSelectedTaskIds([]);
      loadArchivedTasks();
      router.refresh();
    }
    setBulkArchiving(false);
  };

  const deleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      const res = await deleteTaskAction(taskId);
      if (res.error) {
        showToast("error", res.error);
      } else {
        showToast("success", "Task deleted!");
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setArchivedTasks((prev) => prev.filter((t) => t.id !== taskId));
        router.refresh();
      }
    }
  };

  const openDetailDrawer = async (task: Task) => {
    setSelectedTask(task);
    setLoadingFeedback(true);
    setFeedbackList([]);
    const res = await getTaskFeedback(task.id);
    if (res.feedback) {
      setFeedbackList(res.feedback);
    }
    setLoadingFeedback(false);
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !feedbackMessage.trim()) return;

    setSubmittingFeedback(true);
    const res = await addTaskFeedback(selectedTask.id, feedbackMessage.trim());
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast("success", "Feedback added!");
      setFeedbackMessage("");
      const updated = await getTaskFeedback(selectedTask.id);
      if (updated.feedback) setFeedbackList(updated.feedback);
    }
    setSubmittingFeedback(false);
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full">
        {/* STAT CARDS ROW (Excludes Archived Tasks) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Pending", value: stats.pending, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", icon: "pending_actions" },
            { label: "In Progress", value: stats.in_progress, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30", icon: "sync" },
            { label: "Review", value: stats.review, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30", icon: "rate_review" },
            { label: "Completed", value: stats.completed, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "task_alt" },
            { label: "Overdue", value: stats.overdue, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", icon: "warning" },
          ].map((stat) => (
            <div
              key={stat.label}
              title={stat.label}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 shadow-sm min-w-0"
            >
              <div className={`size-8 sm:size-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined text-lg sm:text-xl ${stat.color}`}>{stat.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{stat.value}</p>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate hidden sm:block mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TABS ROW */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          {isAdmin ? (
            <div className="flex gap-6">
              {[
                { id: "mine", label: "My Tasks", count: tabCounts.mine },
                { id: "assigned_by_me", label: "Assigned by Me", count: tabCounts.assigned_by_me },
                { id: "team", label: "Team Tasks", count: tabCounts.team },
                { id: "archived", label: "Archived", count: tabCounts.archived },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-bold">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 pb-3">
              <button
                onClick={() => setShowArchivedView(false)}
                className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  !showArchivedView ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                Active Tasks ({activeTasks.length})
              </button>
              <button
                onClick={() => setShowArchivedView(true)}
                className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  showArchivedView ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                Archived Tasks ({archivedTasks.length})
              </button>
            </div>
          )}
        </div>

        {/* FILTER & BULK ACTIONS TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Priority: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            {isAdmin && agents.length > 0 && (
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Assignee: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Agents</SelectItem>
                  {agents.map((ag) => (
                    <SelectItem key={ag.id} value={ag.id}>
                      {ag.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {!isArchivedTab && selectedTaskIds.length > 0 && (
              <Button
                onClick={handleBulkArchive}
                disabled={bulkArchiving}
                size="sm"
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100 flex items-center gap-1.5 text-xs font-bold"
              >
                {bulkArchiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                Archive Selected ({selectedTaskIds.length})
              </Button>
            )}

            <button
              onClick={() => {
                setStatusFilter("All");
                setPriorityFilter("All");
                setAgentFilter("All");
              }}
              className="text-primary text-xs font-semibold hover:underline px-2 shrink-0"
            >
              Clear filters
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-900 dark:text-slate-100">{filteredTasks.length}</span> {isArchivedTab ? "archived" : ""} tasks
          </div>
        </div>

        {/* MAIN DATA TABLE */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  {!isArchivedTab && (
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length}
                        className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary"
                      />
                    </th>
                  )}
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Task Title & Details</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Priority</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">{isArchivedTab ? "Archived Date" : "Due Date"}</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Assignee</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loadingArchived && isArchivedTab ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading archived tasks...
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      {isArchivedTab ? "No archived tasks found." : "No active tasks found matching your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const overdue = isOverdue(task);
                    const isSelected = selectedTaskIds.includes(task.id);
                    return (
                      <tr
                        key={task.id}
                        onClick={() => openDetailDrawer(task)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer ${
                          overdue ? "bg-rose-50/40 dark:bg-rose-950/10" : ""
                        } ${isSelected ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                      >
                        {!isArchivedTab && (
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(task.id)}
                              className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary"
                            />
                          </td>
                        )}
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="pt-0.5">
                              {overdue ? (
                                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                              ) : (
                                <span className="material-symbols-outlined text-slate-400 text-xl">assignment</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-semibold ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
                                  {task.title}
                                </p>
                                {overdue && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 uppercase">
                                    Overdue
                                  </span>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          {!isArchivedTab ? (
                            <Select value={task.status} onValueChange={(val) => updateStatus(task.id, val)}>
                              <SelectTrigger className="w-[130px] h-8 text-xs font-semibold capitalize bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-xs font-semibold capitalize px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {task.status.replace("_", " ")}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                              task.priority === "critical" || task.priority === "high"
                                ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                : task.priority === "medium"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {task.priority || "medium"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Calendar className={`w-3.5 h-3.5 ${overdue ? "text-rose-500 font-bold" : ""}`} />
                            <span className={overdue ? "text-rose-600 dark:text-rose-400 font-bold" : ""}>
                              {isArchivedTab
                                ? task.archived_at ? new Date(task.archived_at).toLocaleDateString("en-GB") : "Archived"
                                : task.due_date ? new Date(task.due_date).toLocaleDateString("en-GB") : "No due date"}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold uppercase">
                              {task.assignee?.full_name?.[0] || "U"}
                            </div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {task.assignee?.full_name || "Unassigned"}
                            </span>
                          </div>
                        </td>

                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openDetailDrawer(task)}
                              className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {isArchivedTab ? (
                              <button
                                onClick={() => unarchiveTask(task.id)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Unarchive Task"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => archiveTask(task.id)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Archive Task"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateStatus(task.id, task.status === "completed" ? "pending" : "completed")}
                                  className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title={task.status === "completed" ? "Mark Pending" : "Mark Completed"}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Delete Task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="p-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="text-xs text-slate-500 font-medium">Page 1 of 1</div>
            <div className="flex items-center gap-1">
              <button disabled className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 opacity-50">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">
                1
              </button>
              <button disabled className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 opacity-50">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* ADD TASK FAB (Hidden in Archived View) */}
        {!isArchivedTab && (
          <Button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-xl z-40"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        {/* ADD TASK FORM MODAL */}
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative mx-auto my-8">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Add New Task</h2>
                <p className="text-sm text-slate-500 mt-1">Create a new task to track progress.</p>
              </div>
              <AddTaskForm
                onSuccess={() => setIsOpen(false)}
                onMessage={showToast}
                agents={agents}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        )}

        {/* DETAIL DRAWER / MODAL */}
        {selectedTask && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedTask(null)}
          >
            <div
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-xl p-6 relative mx-auto my-8 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4 pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      selectedTask.priority === "high" || selectedTask.priority === "critical"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {selectedTask.priority}
                  </span>
                  {selectedTask.archived_at ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 uppercase">
                      Archived
                    </span>
                  ) : isOverdue(selectedTask) ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 uppercase">
                      Overdue
                    </span>
                  ) : null}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{selectedTask.title}</h2>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Status</span>
                    <span className="font-semibold capitalize text-slate-700 dark:text-slate-200">{selectedTask.status.replace("_", " ")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">{selectedTask.archived_at ? "Archived At" : "Due Date"}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {selectedTask.archived_at
                        ? new Date(selectedTask.archived_at).toLocaleString("en-GB")
                        : selectedTask.due_date
                        ? new Date(selectedTask.due_date).toLocaleDateString("en-GB")
                        : "None"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Assignee</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTask.assignee?.full_name || "Unassigned"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Created At</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{new Date(selectedTask.created_at).toLocaleDateString("en-GB")}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl leading-relaxed">
                    {selectedTask.description || "No description provided."}
                  </p>
                </div>

                {/* Feedback Thread */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Task Feedback & Notes ({feedbackList.length})
                  </h4>

                  {loadingFeedback ? (
                    <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      Loading thread...
                    </div>
                  ) : feedbackList.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/30 rounded-xl">
                      No feedback or comments added yet.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {feedbackList.map((fb) => (
                        <div key={fb.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{fb.author?.full_name || "Agent"}</span>
                            <span className="text-[10px] text-slate-400">{new Date(fb.created_at).toLocaleString("en-GB")}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{fb.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {!selectedTask.archived_at && (
                    <form onSubmit={handleAddFeedback} className="pt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write feedback or note..."
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white"
                      />
                      <Button type="submit" size="sm" disabled={submittingFeedback || !feedbackMessage.trim()} className="text-xs">
                        {submittingFeedback ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Post"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
