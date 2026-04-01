import { connection } from "next/server";
import { getTasks } from "@/lib/api/tasks";
import { TasksClientWrapper } from "@/components/crm/tasks-client-wrapper";

export default async function TaskManagementBoard() {
  await connection();
  const result = await getTasks();
  
  if (result.error) {
    console.error("Task fetch error:", result.error);
  }

  return (
    <TasksClientWrapper initialTasks={result.tasks || []} />
  );
}