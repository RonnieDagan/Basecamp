"use client";

import { useRef, useState, useTransition } from "react";
import { createTechpack } from "./actions";
import { categoryLabels, statusLabels } from "@/lib/techpack-labels";

export function TechpackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <div className="section-head">
        <h2>Techpacks</h2>
        <button type="button" className="btn" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ add techpack"}
        </button>
      </div>

      {open && (
        <form
          key={resetKey}
          ref={formRef}
          className="form-panel open"
          action={(formData: FormData) => {
            startTransition(async () => {
              await createTechpack(formData);
              setResetKey((k) => k + 1);
              setOpen(false);
            });
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label>Product name</label>
              <input name="name" required placeholder="Core thermal" />
            </div>
            <div className="field">
              <label>Category</label>
              <select name="category" defaultValue="Pants">
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Version</label>
              <input name="version" placeholder="v1" />
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue="Active">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Materials / notes</label>
            <textarea name="notes" rows={2} placeholder="Fabric, print method, sizing notes" />
          </div>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Saving…" : "Save techpack"}
          </button>{" "}
          <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      )}
    </>
  );
}
