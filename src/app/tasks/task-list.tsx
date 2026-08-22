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
import { updateTaskDescription, reorderTasks, createDivider, updateDividerOrder, deleteDivider } from "./actions";
import { Linkify } from "@/components/linkify";

const TASK_ORDER_SENTINEL = Number.MAX_SAFE_INTEGER;

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

type SortKey = "due" | "priority" | "domain" | "custom";
type Row = { kind: "task"; task: Task; order: number } | { kind: "divider"; divider: TaskDivider; order: number };

function DragHandle(props: {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
}) {
  return (
    <span className="drag-handle" onClick={(e) => e.stopPropagation()} {...props}>
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} />
      ))}
    </span>
  );
}

function GapIndicator({ active }: { active: boolean }) {
  return (
    <div className="task-gap">
      <div className={`task-gap-bar${active ? " active" : ""}`} />
    </div>
  );
}

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
  dragging,
  onDragHandlePointerDown,
  onDragHandlePointerMove,
  onDragHandlePointerUp,
  onDragHandlePointerCancel,
  onDelete,
}: {
  divider: TaskDivider;
  dragging: boolean;
  onDragHandlePointerDown: (e: React.PointerEvent) => void;
  onDragHandlePointerMove: (e: React.PointerEvent) => void;
  onDragHandlePointerUp: (e: React.PointerEvent) => void;
  onDragHandlePointerCancel: (e: React.PointerEvent) => void;
  onDelete: () => void;
}) {
  return (
    <div className={`task-divider${dragging ? " dragging" : ""}`}>
      <span className="task-divider-label">{divider.label}</span>
      <span className="task-divider-line" />
      <DragHandle
        onPointerDown={onDragHandlePointerDown}
        onPointerMove={onDragHandlePointerMove}
        onPointerUp={onDragHandlePointerUp}
        onPointerCancel={onDragHandlePointerCancel}
      />
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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingKind, setDraggingKind] = useState<"task" | "divider" | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [, startOrderTransition] = useTransition();

  function effectiveOrder(id: string, dbOrder: number | null): number | null {
    return orderOverrides[id] !== undefined ? orderOverrides[id] : dbOrder;
  }

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
  } else if (sortBy === "domain") {
    items.sort((a, b) => domainLabels[a.domain].localeCompare(domainLabels[b.domain]));
  } else {
    items.sort((a, b) => {
      const ao = effectiveOrder(a.id, a.order) ?? TASK_ORDER_SENTINEL;
      const bo = effectiveOrder(b.id, b.order) ?? TASK_ORDER_SENTINEL;
      return ao - bo;
    });
  }

  const now = new Date();

  const effectiveDividers = dividers.map((d) => ({
    ...d,
    order: effectiveOrder(d.id, d.order) ?? d.order,
  }));

  // Positional value per task row: its real order if it has one, otherwise a placeholder
  // that increments just past whatever real value came before it (nulls always sort last).
  const taskRows: Row[] = [];
  let cursor = 0;
  for (const task of items) {
    const real = effectiveOrder(task.id, task.order);
    let pos: number;
    if (real !== null) {
      pos = real;
      cursor = real;
    } else {
      cursor += 1;
      pos = cursor;
    }
    taskRows.push({ kind: "task", task, order: pos });
  }

  // Merge dividers into the task list by comparing order values directly, rather than
  // splicing by row index (which drifts once more than one divider is present, since
  // each earlier splice grows the array the next divider's index is computed against).
  const dividersSorted = [...effectiveDividers].sort((a, b) => a.order - b.order);
  const rows: Row[] = [];
  let taskCursorIdx = 0;
  for (const divider of dividersSorted) {
    while (taskCursorIdx < taskRows.length && taskRows[taskCursorIdx].order < divider.order) {
      rows.push(taskRows[taskCursorIdx]);
      taskCursorIdx++;
    }
    rows.push({ kind: "divider", divider, order: divider.order });
  }
  while (taskCursorIdx < taskRows.length) {
    rows.push(taskRows[taskCursorIdx]);
    taskCursorIdx++;
  }

  function persistDividerOrder(id: string, newOrder: number) {
    setOrderOverrides((prev) => ({ ...prev, [id]: newOrder }));
    startOrderTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("order", String(newOrder));
      await updateDividerOrder(fd);
    });
  }

  function removeDivider(id: string) {
    startOrderTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteDivider(fd);
    });
  }

  function handleRowPointerMove(e: React.PointerEvent) {
    if (!draggingId) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const rowEl = el?.closest("[data-row-index]") as HTMLElement | null;
    if (!rowEl) return;
    const idx = Number(rowEl.dataset.rowIndex);
    const rect = rowEl.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const gap = e.clientY < midpoint ? idx : idx + 1;
    setDragOverIndex((prev) => (prev === gap ? prev : gap));
  }

  function isDraggedRow(r: Row) {
    return (r.kind === "task" && r.task.id === draggingId) || (r.kind === "divider" && r.divider.id === draggingId);
  }

  function rowOrderAbove(gap: number): number | null {
    for (let i = gap - 1; i >= 0; i--) {
      if (!isDraggedRow(rows[i])) return rows[i].order;
    }
    return null;
  }

  function rowOrderBelow(gap: number): number | null {
    for (let i = gap; i < rows.length; i++) {
      if (!isDraggedRow(rows[i])) return rows[i].order;
    }
    return null;
  }

  function finalizeTaskDrop(taskId: string) {
    // Count non-dragged task rows before the drop gap to find where the
    // dragged task lands within the task-only ordering (rows interleave
    // dividers, so we can't use dragOverIndex directly as a task index).
    let insertionIndex = 0;
    for (let i = 0; i < dragOverIndex!; i++) {
      const r = rows[i];
      if (r.kind === "task" && r.task.id !== taskId) insertionIndex++;
    }

    const taskIds = items.map((t) => t.id).filter((id) => id !== taskId);
    taskIds.splice(insertionIndex, 0, taskId);

    // Renumber every visible task with a fresh sequential order. Persisting
    // only the dragged task would leave its still-null siblings sorting
    // after it regardless of intended position, since null always sorts last.
    const updates = taskIds.map((id, idx) => ({ id, order: idx }));

    setOrderOverrides((prev) => {
      const next = { ...prev };
      for (const u of updates) next[u.id] = u.order;
      return next;
    });
    startOrderTransition(async () => {
      const fd = new FormData();
      fd.set("updates", JSON.stringify(updates));
      await reorderTasks(fd);
    });
  }

  function finalizeDividerDrop(dividerId: string) {
    const above = rowOrderAbove(dragOverIndex!);
    const below = rowOrderBelow(dragOverIndex!);
    const newOrder =
      above !== null && below !== null
        ? (above + below) / 2
        : above !== null
          ? above + 1
          : below !== null
            ? below - 1
            : 0;
    persistDividerOrder(dividerId, newOrder);
  }

  function finalizeDrop() {
    if (draggingId && draggingKind && dragOverIndex !== null) {
      if (draggingKind === "task") finalizeTaskDrop(draggingId);
      else finalizeDividerDrop(draggingId);
    }
    setDraggingId(null);
    setDraggingKind(null);
    setDragOverIndex(null);
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
          <option value="custom">Sort: Custom (drag to reorder)</option>
        </select>
      </div>

      <DividerForm />

      {sortBy === "custom" && (
        <div className="caption" style={{ marginBottom: "8px" }}>
          Drag the ⠿ handle to reorder tasks. Custom order only applies in this sort mode.
        </div>
      )}

      {rows.length === 0 ? (
        <div className="empty">No tasks match this view.</div>
      ) : (
        <>
          {rows.map((row, i) => {
            const gapBefore = draggingId && <GapIndicator key={`gap-${i}`} active={dragOverIndex === i} />;

            if (row.kind === "divider") {
              return (
                <div key={row.divider.id} style={{ display: "contents" }}>
                  {gapBefore}
                  <div data-row-index={i} style={{ display: "contents" }}>
                    <DividerRow
                      divider={row.divider}
                      dragging={draggingKind === "divider" && draggingId === row.divider.id}
                      onDragHandlePointerDown={(e) => {
                        e.preventDefault();
                        (e.currentTarget as Element).setPointerCapture(e.pointerId);
                        setDraggingId(row.divider.id);
                        setDraggingKind("divider");
                      }}
                      onDragHandlePointerMove={handleRowPointerMove}
                      onDragHandlePointerUp={finalizeDrop}
                      onDragHandlePointerCancel={finalizeDrop}
                      onDelete={() => removeDivider(row.divider.id)}
                    />
                  </div>
                </div>
              );
            }
            const task = row.task;
            const color = domainColors[task.domain];
            const overdue = Boolean(task.dueDate && task.status !== "Done" && task.dueDate < now);
            return (
              <div key={task.id} style={{ display: "contents" }}>
                {gapBefore}
                <details
                  className={`row-details${draggingKind === "task" && draggingId === task.id ? " dragging" : ""}`}
                  data-row-index={i}
                >
                  <summary>
                    {sortBy === "custom" && (
                      <DragHandle
                        onPointerDown={(e) => {
                          e.preventDefault();
                          (e.currentTarget as Element).setPointerCapture(e.pointerId);
                          setDraggingId(task.id);
                          setDraggingKind("task");
                        }}
                        onPointerMove={handleRowPointerMove}
                        onPointerUp={finalizeDrop}
                        onPointerCancel={finalizeDrop}
                      />
                    )}
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
                      <form action={updateTaskDescription} style={{ display: "flex", gap: "8px" }}>
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
              </div>
            );
          })}
          {draggingId && <GapIndicator active={dragOverIndex === rows.length} />}
        </>
      )}
    </>
  );
}
