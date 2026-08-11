"use client";

import { useState, useTransition } from "react";
import { addPackingItem } from "./actions";

type CatalogEntry = { name: string; sizes: string[] };

export function AddItemForm({ batchId, catalog }: { batchId: string; catalog: CatalogEntry[] }) {
  const [pending, startTransition] = useTransition();
  const [productName, setProductName] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const matched = catalog.find((c) => c.name.toLowerCase() === productName.trim().toLowerCase());

  return (
    <form
      key={resetKey}
      action={(formData: FormData) => {
        startTransition(async () => {
          await addPackingItem(formData);
          setProductName("");
          setResetKey((k) => k + 1);
        });
      }}
      style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "16px" }}
    >
      <input type="hidden" name="batchId" value={batchId} />
      <div className="field" style={{ flex: "2 1 220px", marginBottom: 0 }}>
        <label>Product</label>
        <input
          name="productName"
          list="catalog-products"
          required
          placeholder="Pick or type a product"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          autoComplete="off"
        />
        <datalist id="catalog-products">
          {catalog.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>
      </div>
      <div className="field" style={{ flex: "1 1 110px", marginBottom: 0 }}>
        <label>Size</label>
        {matched && matched.sizes.length > 0 ? (
          <select name="size" required defaultValue="">
            <option value="" disabled>
              Select
            </option>
            {matched.sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <input name="size" required placeholder="e.g. M" />
        )}
      </div>
      <div className="field" style={{ flex: "0 1 80px", marginBottom: 0 }}>
        <label>Qty</label>
        <input name="needed" type="number" min="1" step="1" required placeholder="1" />
      </div>
      <button type="submit" className="btn small" disabled={pending}>
        {pending ? "Adding…" : "+ Add row"}
      </button>
    </form>
  );
}
