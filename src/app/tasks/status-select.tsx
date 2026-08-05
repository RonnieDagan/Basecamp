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
        key={status}
        className="status-select"
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        style={{ width: "120px" }}
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
