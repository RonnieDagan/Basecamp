"use client";

import { useRef, useState, useTransition } from "react";
import { createFinanceItem } from "./actions";
import { typeLabels } from "@/lib/finance-labels";
import { DatePicker } from "@/components/date-picker";

export function FinanceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <div className="section-head">
        <h2>Finance</h2>
        <button type="button" className="btn" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ add item"}
        </button>
      </div>

      {open && (
        <form
          key={resetKey}
          ref={formRef}
          className="form-panel open"
          action={(formData: FormData) => {
            startTransition(async () => {
              await createFinanceItem(formData);
              setResetKey((k) => k + 1);
              setOpen(false);
            });
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label>Type</label>
              <select name="type" defaultValue="CreditCard">
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Name</label>
              <input name="name" required placeholder="Q3 2026 CDTFA return" />
            </div>
            <div className="field">
              <label>Due / key date</label>
              <DatePicker name="date" />
            </div>
            <div className="field">
              <label>Amount ($)</label>
              <input name="amount" type="number" step="0.01" placeholder="0" />
            </div>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea name="notes" rows={2} />
          </div>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Saving…" : "Save item"}
          </button>{" "}
          <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      )}
    </>
  );
}
