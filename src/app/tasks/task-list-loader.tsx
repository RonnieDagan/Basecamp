import { prisma } from "@/lib/prisma";
import { TaskList } from "./task-list";

export async function TaskListLoader() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  return <TaskList tasks={tasks} />;
}
