"use client";

import { useRef, useState, useTransition } from "react";
import { createCase } from "./actions";
import { issueLabels, resolutionLabels, statusLabels } from "@/lib/case-labels";

export function CaseForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <div className="section-head">
        <h2>Customer cases</h2>
        <button type="button" className="btn" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ add case"}
        </button>
      </div>

      {open && (
        <form
          key={resetKey}
          ref={formRef}
          className="form-panel open"
          action={(formData: FormData) => {
            startTransition(async () => {
              await createCase(formData);
              setResetKey((k) => k + 1);
              setOpen(false);
            });
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label>Customer name</label>
              <input name="customer" required placeholder="Customer name" />
            </div>
            <div className="field">
              <label>Issue type</label>
              <select name="issue" defaultValue="DelayedShipment">
                {Object.entries(issueLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Resolution</label>
              <select name="resolution" defaultValue="Pending">
                {Object.entries(resolutionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue="Open">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea name="notes" rows={2} />
          </div>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Saving…" : "Save case"}
          </button>{" "}
          <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      )}
    </>
  );
}
