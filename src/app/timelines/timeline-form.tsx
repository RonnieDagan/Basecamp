"use client";

import { useRef, useState, useTransition } from "react";
import { createTimeline } from "./actions";

export function TimelineForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Timelines</h2>
          <span className="caption">
            Sourcing → Production → Booked → In transit → Customs → Delivered. A timeline can
            track any product or goal — click a waypoint to log notes or attachments for that
            stage.
          </span>
        </div>
        <button type="button" className="btn" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ add timeline"}
        </button>
      </div>

      {open && (
        <form
          key={resetKey}
          ref={formRef}
          className="form-panel open"
          action={(formData: FormData) => {
            startTransition(async () => {
              await createTimeline(formData);
              setResetKey((k) => k + 1);
              setOpen(false);
            });
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label>Name</label>
              <input name="name" required placeholder="Switch-Back Pants — Run 3, or any goal" />
            </div>
            <div className="field" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <label style={{ margin: "0 8px 0 0", display: "inline" }}>
                <input
                  type="checkbox"
                  name="flagged"
                  style={{ width: "auto", verticalAlign: "middle" }}
                />{" "}
                Flag for attention
              </label>
            </div>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea name="notes" rows={2} placeholder="What this run/goal is about" />
          </div>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Saving…" : "Save timeline"}
          </button>{" "}
          <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      )}
    </>
  );
}
