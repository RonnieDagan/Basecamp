"use client";

import { useRef, useState, useTransition } from "react";
import { createCatalogProduct } from "./actions";

export function CatalogForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <div className="section-head">
        <h2 style={{ fontSize: "15px" }}>Product catalog</h2>
        <button type="button" className="btn ghost small" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ add product"}
        </button>
      </div>

      {open && (
        <form
          key={resetKey}
          ref={formRef}
          className="form-panel open"
          action={(formData: FormData) => {
            startTransition(async () => {
              await createCatalogProduct(formData);
              setResetKey((k) => k + 1);
            });
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label>Product name</label>
              <input name="name" required placeholder="Bear Family Thermal - White" />
            </div>
            <div className="field">
              <label>Sizes (comma-separated)</label>
              <input name="sizes" placeholder="XS, S, M, L, XL" />
            </div>
          </div>
          <button type="submit" className="btn small" disabled={pending}>
            {pending ? "Saving…" : "Save product"}
          </button>
        </form>
      )}
    </>
  );
}
