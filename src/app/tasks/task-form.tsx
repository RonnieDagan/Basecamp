"use client";

import { useRef, useTransition } from "react";
import { createTask } from "./actions";
import { domainLabels, priorityLabels } from "@/lib/task-labels";

export function TaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData: FormData) => {
        startTransition(async () => {
          await createTask(formData);
          formRef.current?.reset();
        });
      }}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-4"
    >
      <div className="flex min-w-[12rem] flex-1 flex-col gap-1">
        <label className="text-xs text-neutral-400">Title</label>
        <input
          name="title"
          required
          placeholder="e.g. Follow up with EMD on ISF filing"
          className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-400">Domain</label>
        <select
          name="domain"
          defaultValue="General"
          className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
        >
          {Object.entries(domainLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-400">Priority</label>
        <select
          name="priority"
          defaultValue="Medium"
          className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
        >
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-400">Due date</label>
        <input
          type="date"
          name="dueDate"
          className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add task"}
      </button>
    </form>
  );
}
