"use client";

import { useState, useTransition } from "react";
import { setItemRemaining, resetBatch, completeBatch } from "./actions";

type Item = { id: string; productName: string; size: string; needed: number; remaining: number };

export function PackingActiveView({ batchId, items: initialItems }: { batchId: string; items: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [, startTransition] = useTransition();

  function persistRemaining(id: string, remaining: number) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("remaining", String(remaining));
      await setItemRemaining(fd);
    });
  }

  function setRemaining(id: string, value: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const clamped = Math.max(0, Math.min(item.needed, value));
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, remaining: clamped } : i)));
    persistRemaining(id, clamped);
  }

  function resetOne(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setRemaining(id, item.needed);
  }

  function resetAll() {
    setItems((prev) => prev.map((i) => ({ ...i, remaining: i.needed })));
    startTransition(async () => {
      const fd = new FormData();
      fd.set("batchId", batchId);
      await resetBatch(fd);
    });
  }

  const totalNeeded = items.reduce((sum, i) => sum + i.needed, 0);
  const totalPacked = items.reduce((sum, i) => sum + (i.needed - i.remaining), 0);
  const pct = totalNeeded > 0 ? Math.round((totalPacked / totalNeeded) * 100) : 0;
  const allDone = items.length > 0 && items.every((i) => i.remaining === 0);

  return (
    <div className="card">
      <div className="section-head" style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "14px", fontWeight: 500 }}>
          {totalPacked} / {totalNeeded} items packed
        </div>
        <button type="button" className="btn ghost small" onClick={resetAll}>
          Reset all
        </button>
      </div>
      <div className="progress-bar" style={{ marginBottom: "18px" }}>
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div>
        {items.map((item) => {
          const done = item.remaining === 0;
          return (
            <div className={`packing-row${done ? " done" : ""}`} key={item.id}>
              <div style={{ flex: "1 1 100%", fontSize: "14px" }}>
                {done ? "✓ " : ""}
                {item.productName} <span style={{ color: "var(--text-dim)" }}>· {item.size}</span>{" "}
                <span className="caption" style={{ marginTop: 0 }}>
                  needed {item.needed}
                </span>
              </div>
              <div style={{ flex: "1 1 100%", display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  className="qty-btn"
                  disabled={item.remaining <= 0}
                  onClick={() => setRemaining(item.id, item.remaining - 1)}
                  aria-label="Decrement remaining"
                >
                  −
                </button>
                <span className="packing-remaining">{item.remaining}</span>
                <button
                  type="button"
                  className="qty-btn"
                  disabled={item.remaining >= item.needed}
                  onClick={() => setRemaining(item.id, item.remaining + 1)}
                  aria-label="Increment remaining"
                >
                  +
                </button>
                <button
                  type="button"
                  className="btn ghost small"
                  style={{ marginLeft: "auto" }}
                  onClick={() => resetOne(item.id)}
                >
                  Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <form action={completeBatch} style={{ marginTop: "18px" }}>
        <input type="hidden" name="batchId" value={batchId} />
        <button type="submit" className="btn" disabled={!allDone}>
          Mark batch complete
        </button>
      </form>
    </div>
  );
}
