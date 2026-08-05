"use client";

import { useRef, useState, useTransition } from "react";
import { createPost } from "./actions";
import { platformLabels, typeLabels, statusLabels } from "@/lib/content-labels";
import { DatePicker } from "@/components/date-picker";

export function ContentForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <div className="section-head">
        <h2>Content calendar</h2>
        <button type="button" className="btn" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ add post"}
        </button>
      </div>

      {open && (
        <form
          key={resetKey}
          ref={formRef}
          className="form-panel open"
          action={(formData: FormData) => {
            startTransition(async () => {
              await createPost(formData);
              setResetKey((k) => k + 1);
              setOpen(false);
            });
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label>Platform</label>
              <select name="platform" defaultValue="Instagram">
                {Object.entries(platformLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Type</label>
              <select name="type" defaultValue="Reel">
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Planned date</label>
              <DatePicker name="date" />
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue="Idea">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Linked product</label>
              <input name="product" placeholder="Trailhead hat" />
            </div>
            <div className="field">
              <label>UGC partner</label>
              <input name="partner" placeholder="Creator handle, optional" />
            </div>
          </div>
          <div className="field">
            <label>Idea / caption</label>
            <textarea name="notes" rows={2} placeholder="Hook, caption draft, or shot list" />
          </div>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Saving…" : "Save post"}
          </button>{" "}
          <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      )}
    </>
  );
}
