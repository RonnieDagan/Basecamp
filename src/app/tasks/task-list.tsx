"use client";

import { useState } from "react";
import type { Task } from "@prisma/client";
import {
  domainLabels,
  domainColors,
  priorityLabels,
  priorityColors,
  priorityOrder,
  statusColors,
  statusLabels,
} from "@/lib/task-labels";
import { StatusSelect } from "./status-select";
import { DeleteTaskButton } from "./delete-task-button";
import { updateTaskDescription } from "./actions";
import { Linkify } from "@/components/linkify";

function truncateText(text: string, max = 80) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

type SortKey = "due" | "priority" | "domain";

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [domainFilter, setDomainFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("due");

  let items = domainFilter === "all" ? tasks : tasks.filter((t) => t.domain === domainFilter);
  items = [...items];
  if (sortBy === "due") {
    items.sort((a, b) => {
      const ad = a.dueDate ? a.dueDate.getTime() : Infinity;
      const bd = b.dueDate ? b.dueDate.getTime() : Infinity;
      return ad - bd;
    });
  } else if (sortBy === "priority") {
    items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else {
    items.sort((a, b) => domainLabels[a.domain].localeCompare(domainLabels[b.domain]));
  }

  const now = new Date();

  return (
    <>
      <div className="filter-row">
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
          <option value="all">All domains</option>
          {Object.entries(domainLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
          <option value="due">Sort by due date</option>
          <option value="priority">Sort by priority</option>
          <option value="domain">Sort by domain</option>
        </select>
      </div>

      {items.length === 0 ? (
        <div className="empty">No tasks match this view.</div>
      ) : (
        items.map((task) => {
          const color = domainColors[task.domain];
          const overdue = Boolean(task.dueDate && task.status !== "Done" && task.dueDate < now);
          return (
            <details className="row-details" key={task.id}>
              <summary>
                <div className="dot" style={{ background: color }} />
                <span
                  className="tag"
                  style={{
                    background: hexToRgba(color, 0.18),
                    color,
                    width: "120px",
                    textAlign: "center",
                  }}
                >
                  {domainLabels[task.domain]}
                </span>
                <span className="task-priority" style={{ color: priorityColors[task.priority] }}>
                  {priorityLabels[task.priority]}
                </span>
                <span className="row-title-wrap">
                  <span
                    className="row-title"
                    style={{
                      textDecoration: task.status === "Done" ? "line-through" : "none",
                      color: task.status === "Done" ? "var(--text-dimmer)" : "var(--paper)",
                    }}
                  >
                    {task.title}
                  </span>
                  {task.description && (
                    <span className="row-preview" style={{ maxWidth: "none" }}>
                      {truncateText(task.description)}
                    </span>
                  )}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: "12px",
                    color: overdue ? "var(--clay-light)" : "var(--text-dim)",
                    width: "56px",
                    textAlign: "right",
                  }}
                >
                  {formatDate(task.dueDate)}
                </span>
                <div
                  className="dot"
                  title={statusLabels[task.status]}
                  style={{ background: statusColors[task.status], marginRight: "-4px" }}
                />
                <span onClick={(e) => e.stopPropagation()}>
                  <StatusSelect id={task.id} status={task.status} />
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <DeleteTaskButton id={task.id} />
                </span>
              </summary>

              <div className="row-expanded">
                <div className="field">
                  <label>Description</label>
                  <Linkify text={task.description} />
                  <form
                    action={updateTaskDescription}
                    style={{ display: "flex", gap: "8px" }}
                  >
                    <input type="hidden" name="id" value={task.id} />
                    <textarea
                      name="description"
                      rows={4}
                      defaultValue={task.description ?? ""}
                      placeholder="Additional detail, links, or context"
                    />
                    <button type="submit" className="btn small">
                      Save
                    </button>
                  </form>
                </div>
              </div>
            </details>
          );
        })
      )}
    </>
  );
}
