"use client";

import { useRef, useState, useTransition } from "react";
import { createShipment } from "./actions";
import { DatePicker } from "@/components/date-picker";

export function ShipmentForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <div className="section-head">
        <h2>Shipments</h2>
        <button type="button" className="btn" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ add shipment"}
        </button>
      </div>

      {open && (
        <form
          key={resetKey}
          ref={formRef}
          className="form-panel open"
          action={(formData: FormData) => {
            startTransition(async () => {
              await createShipment(formData);
              setResetKey((k) => k + 1);
              setOpen(false);
            });
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label>Name</label>
              <input name="name" required placeholder="Switch-Back Pants — Run 3" />
            </div>
            <div className="field">
              <label>Tracking number</label>
              <input name="tracking" placeholder="Last-leg carrier tracking #" />
            </div>
            <div className="field">
              <label>ETA</label>
              <DatePicker name="eta" />
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
            <textarea
              name="notes"
              rows={2}
              placeholder="Freight method, manufacturer, incoterm, or anything else worth remembering"
            />
          </div>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Saving…" : "Save shipment"}
          </button>{" "}
          <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      )}
    </>
  );
}
