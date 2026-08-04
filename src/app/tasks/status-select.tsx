"use client";

import { useRef } from "react";
import { updateTaskStatus } from "./actions";
import { statusLabels } from "@/lib/task-labels";
import { TaskStatus } from "@/generated/prisma/client";

export function StatusSelect({ id, status }: { id: string; status: TaskStatus }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateTaskStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-neutral-100"
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
