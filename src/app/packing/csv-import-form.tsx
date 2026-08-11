"use client";

import { useState, useTransition } from "react";
import { importCsv } from "./actions";

export function CsvImportForm() {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div style={{ marginBottom: "18px" }}>
      <button type="button" className="btn ghost small" onClick={() => setOpen((o) => !o)}>
        {open ? "Cancel CSV import" : "Import from CSV"}
      </button>

      {open && (
        <form
          key={resetKey}
          className="form-panel open"
          action={(formData: FormData) => {
            startTransition(async () => {
              await importCsv(formData);
              setOpen(false);
              setResetKey((k) => k + 1);
            });
          }}
        >
          <div className="field">
            <label>CSV file</label>
            <input type="file" name="file" accept=".csv,text/csv" />
          </div>
          <div className="caption" style={{ marginBottom: "8px" }}>
            Or paste CSV text below instead — format: product,size,qty_needed (header row optional).
          </div>
          <div className="field">
            <label>Paste CSV</label>
            <textarea
              name="csvText"
              rows={6}
              placeholder={
                "product,size,qty_needed\nBear Family Thermal - White,M,14\nForager Beanie - Navy,One Size,3"
              }
            />
          </div>
          <button type="submit" className="btn small" disabled={pending}>
            {pending ? "Importing…" : "Import"}
          </button>
        </form>
      )}
    </div>
  );
}
