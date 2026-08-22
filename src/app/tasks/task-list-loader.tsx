import { prisma } from "@/lib/prisma";
import { TaskList } from "./task-list";

export async function TaskListLoader() {
  const [tasks, dividers] = await Promise.all([
    prisma.task.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.taskDivider.findMany({ orderBy: { order: "asc" } }),
  ]);
  return <TaskList tasks={tasks} dividers={dividers} />;
}
