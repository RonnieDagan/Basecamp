"use client";

import { useState, useTransition } from "react";
import type { Task, TaskDivider } from "@prisma/client";
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
import { updateTaskDescription, createDivider, updateDividerOrder, deleteDivider } from "./actions";
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
type Row = { kind: "task"; task: Task; order: number } | { kind: "divider"; divider: TaskDivider; order: number };

function DividerForm() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const label = value.trim();
    if (!label) return;
    setValue("");
    setOpen(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("label", label);
      await createDivider(fd);
    });
  }

  if (open) {
    return (
      <div className="add-divider-row open">
        <input
          autoFocus
          className="add-divider-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Divider label, e.g. Today"
        />
        <button type="button" className="btn small" onClick={submit} disabled={pending || !value.trim()}>
          {pending ? "Adding…" : "Add"}
        </button>
        <button type="button" className="btn ghost small" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="add-divider-row">
      <span className="add-divider-line" />
      <button type="button" className="add-divider-btn" onClick={() => setOpen(true)}>
        + Add divider
      </button>
      <span className="add-divider-line" />
    </div>
  );
}

function DividerRow({
  divider,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  divider: TaskDivider;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="task-divider">
      <span className="task-divider-label">{divider.label}</span>
      <span className="task-divider-line" />
      <button type="button" onClick={onMoveUp} disabled={!canMoveUp} aria-label="Move divider up">
        ▲
      </button>
      <button type="button" onClick={onMoveDown} disabled={!canMoveDown} aria-label="Move divider down">
        ▼
      </button>
      <button type="button" className="icon-del" onClick={onDelete} aria-label="Delete divider">
        ✕
      </button>
    </div>
  );
}

export function TaskList({ tasks, dividers }: { tasks: Task[]; dividers: TaskDivider[] }) {
  const [domainFilter, setDomainFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("due");
  const [orderOverrides, setOrderOverrides] = useState<Record<string, number>>({});
  const [, startDividerTransition] = useTransition();

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

  const effectiveDividers = dividers.map((d) =>
    orderOverrides[d.id] !== undefined ? { ...d, order: orderOverrides[d.id] } : d
  );

  const rows: Row[] = items.map((task, i) => ({ kind: "task", task, order: i }));
  for (const divider of [...effectiveDividers].sort((a, b) => a.order - b.order)) {
    const idx = Math.max(0, Math.min(rows.length, Math.round(divider.order)));
    rows.splice(idx, 0, { kind: "divider", divider, order: divider.order });
  }

  function persistOrder(id: string, newOrder: number) {
    setOrderOverrides((prev) => ({ ...prev, [id]: newOrder }));
    startDividerTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("order", String(newOrder));
      await updateDividerOrder(fd);
    });
  }

  function moveDivider(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    const current = rows[index];
    const target = rows[targetIndex];
    if (current.kind !== "divider") return;

    // New order goes just past the neighbor we're swapping with, relative to whatever's beyond it.
    const beyondIndex = targetIndex + direction;
    const beyond = beyondIndex >= 0 && beyondIndex < rows.length ? rows[beyondIndex].order : null;
    const newOrder = beyond !== null ? (target.order + beyond) / 2 : target.order + direction;

    persistOrder(current.divider.id, newOrder);
  }

  function removeDivider(id: string) {
    startDividerTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteDivider(fd);
    });
  }

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

      <DividerForm />

      {rows.length === 0 ? (
        <div className="empty">No tasks match this view.</div>
      ) : (
        rows.map((row, i) => {
          if (row.kind === "divider") {
            return (
              <DividerRow
                key={row.divider.id}
                divider={row.divider}
                canMoveUp={i > 0}
                canMoveDown={i < rows.length - 1}
                onMoveUp={() => moveDivider(i, -1)}
                onMoveDown={() => moveDivider(i, 1)}
                onDelete={() => removeDivider(row.divider.id)}
              />
            );
          }
          const task = row.task;
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
