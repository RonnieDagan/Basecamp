import { prisma } from "@/lib/prisma";
import { domainLabels, priorityLabels, priorityOrder } from "@/lib/task-labels";
import { AppNav } from "@/components/app-nav";
import { TaskForm } from "./task-form";
import { StatusSelect } from "./status-select";
import { DeleteTaskButton } from "./delete-task-button";
import { Domain } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

function formatDueDate(date: Date | null) {
  if (!date) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const priorityBadgeClasses: Record<string, string> = {
  Urgent: "bg-red-500/15 text-red-400",
  High: "bg-orange-500/15 text-orange-400",
  Medium: "bg-blue-500/15 text-blue-400",
  Low: "bg-neutral-500/15 text-neutral-400",
};

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const overdueCount = tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== "Done"
  ).length;
  const dueThisWeekCount = tasks.filter(
    (t) => t.dueDate && t.dueDate >= now && t.dueDate <= weekFromNow && t.status !== "Done"
  ).length;

  const tasksByDomain = new Map<Domain, typeof tasks>();
  for (const domain of Object.keys(domainLabels) as Domain[]) {
    tasksByDomain.set(domain, []);
  }
  for (const task of tasks) {
    tasksByDomain.get(task.domain)?.push(task);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <AppNav />
      <main className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        <div className="flex gap-4 text-sm">
          <span className={overdueCount > 0 ? "text-red-400" : "text-neutral-500"}>
            {overdueCount} overdue
          </span>
          <span className="text-neutral-500">{dueThisWeekCount} due this week</span>
        </div>

        <TaskForm />

        <div className="space-y-6">
          {Array.from(tasksByDomain.entries()).map(([domain, domainTasks]) => {
            if (domainTasks.length === 0) return null;

            const sorted = [...domainTasks].sort(
              (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
            );

            return (
              <section key={domain}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {domainLabels[domain]}
                </h2>
                <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
                  {sorted.map((task) => {
                    const isOverdue =
                      task.dueDate && task.dueDate < now && task.status !== "Done";
                    return (
                      <li
                        key={task.id}
                        className="flex flex-wrap items-center gap-3 px-4 py-3"
                      >
                        <div className="min-w-[10rem] flex-1">
                          <p
                            className={
                              task.status === "Done"
                                ? "text-neutral-500 line-through"
                                : "text-neutral-100"
                            }
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-neutral-500">{task.description}</p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityBadgeClasses[task.priority]}`}
                        >
                          {priorityLabels[task.priority]}
                        </span>

                        {task.dueDate && (
                          <span className={`text-xs ${isOverdue ? "text-red-400" : "text-neutral-500"}`}>
                            {formatDueDate(task.dueDate)}
                          </span>
                        )}

                        <StatusSelect id={task.id} status={task.status} />
                        <DeleteTaskButton id={task.id} />
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          {tasks.length === 0 && (
            <p className="text-sm text-neutral-500">No tasks yet — add your first one above.</p>
          )}
        </div>
      </main>
    </div>
  );
}
