"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addPackingItems } from "./actions";

type CatalogEntry = { name: string; sizes: string[] };

export function AddItemForm({ batchId, catalog }: { batchId: string; catalog: CatalogEntry[] }) {
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const trimmed = query.trim();
  const matched = catalog.find((c) => c.name.toLowerCase() === trimmed.toLowerCase()) ?? null;
  const filtered = trimmed
    ? catalog.filter((c) => c.name.toLowerCase().includes(trimmed.toLowerCase()))
    : catalog;

  function choose(name: string) {
    setQuery(name);
    setOpen(false);
  }

  return (
    <div className="packing-add-panel">
      <form
        key={resetKey}
        action={(formData: FormData) => {
          startTransition(async () => {
            const bulk = new FormData();
            bulk.set("batchId", batchId);

            if (matched && matched.sizes.length > 0) {
              const rows = matched.sizes
                .map((s) => ({ size: s, needed: Number(formData.get(`size__${s}`) ?? 0) }))
                .filter((r) => Number.isFinite(r.needed) && r.needed > 0);
              if (rows.length === 0) return;
              bulk.set("productName", matched.name);
              bulk.set("itemsJson", JSON.stringify(rows));
            } else {
              const productName = String(formData.get("productName") ?? trimmed).trim();
              const size = String(formData.get("size") ?? "").trim();
              const needed = Number(formData.get("needed") ?? 0);
              if (!productName || !size || !Number.isFinite(needed) || needed <= 0) return;
              bulk.set("productName", productName);
              bulk.set("itemsJson", JSON.stringify([{ size, needed }]));
            }

            await addPackingItems(bulk);
            setQuery("");
            setResetKey((k) => k + 1);
          });
        }}
      >
        <div className="field combo" ref={containerRef}>
          <label>Product</label>
          <input
            name="productName"
            required
            placeholder="Search the catalog or type a new product…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
          />
          {open && (
            <div className="combo-popup">
              {filtered.length === 0 ? (
                <div className="combo-empty">
                  No catalog match — this will be added as a one-off product.
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    type="button"
                    key={c.name}
                    className="combo-option"
                    onClick={() => choose(c.name)}
                  >
                    <span>{c.name}</span>
                    <span className="caption">{c.sizes.length > 0 ? c.sizes.join(", ") : "no sizes set"}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {matched && matched.sizes.length > 0 ? (
          <>
            <div className="caption" style={{ fontSize: "12px" }}>
              Enter quantity needed for each size — leave a size blank to skip it.
            </div>
            <div className="size-grid">
              {matched.sizes.map((s) => (
                <div className="size-chip" key={s}>
                  <label>{s}</label>
                  <input name={`size__${s}`} type="number" min="0" step="1" placeholder="0" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="form-grid" style={{ marginTop: "14px" }}>
            <div className="field">
              <label>Size</label>
              <input name="size" required placeholder="e.g. M, or One Size" />
            </div>
            <div className="field">
              <label>Qty needed</label>
              <input name="needed" type="number" min="1" step="1" required placeholder="1" />
            </div>
          </div>
        )}

        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Adding…" : "+ Add to packing list"}
        </button>
      </form>
    </div>
  );
}
