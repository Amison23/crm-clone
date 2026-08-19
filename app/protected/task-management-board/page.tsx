import { Suspense } from "react";
import { connection } from "next/server";
import { getTasks } from "@/lib/api/tasks";
import { TasksClientWrapper } from "@/components/crm/tasks-client-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TaskManagementBoardPage() {
  return (
    <Suspense fallback={<TasksBoardSkeleton />}>
      <TaskManagementBoardData />
    </Suspense>
  );
}

async function TaskManagementBoardData() {
  await connection();
  const result = await getTasks();
  
  if (result.error) {
    console.error("Task fetch error:", result.error);
  }

  return (
    <TasksClientWrapper 
      initialTasks={result.tasks || []} 
      agents={result.agents || []}
      isAdmin={result.isAdmin || false}
    />
  );
}

function TasksBoardSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[600px] flex-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800" />
        ))}
      </div>
    </div>
  );
}