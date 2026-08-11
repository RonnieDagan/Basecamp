import { prisma } from "@/lib/prisma";
import {
  startBatch,
  startPacking,
  removePackingItem,
  setItemRemaining,
  resetItem,
  resetBatch,
  completeBatch,
} from "./actions";
import { AddItemForm } from "./add-item-form";
import { CsvImportForm } from "./csv-import-form";

export async function PackingBoard() {
  const [batch, catalog] = await Promise.all([
    prisma.packingBatch.findFirst({
      where: { status: { in: ["Draft", "Active"] } },
      include: { items: true },
    }),
    prisma.catalogProduct.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!batch) {
    return (
      <div className="card">
        <div className="caption" style={{ marginBottom: "12px", fontSize: "13px" }}>
          No active packing list. Start one to begin building today&apos;s list.
        </div>
        <form action={startBatch}>
          <button type="submit" className="btn">
            Start new packing list
          </button>
        </form>
      </div>
    );
  }

  const items = [...batch.items].sort(
    (a, b) => a.productName.localeCompare(b.productName) || a.size.localeCompare(b.size)
  );

  if (batch.status === "Draft") {
    return (
      <div className="card">
        <CsvImportForm />
        <AddItemForm batchId={batch.id} catalog={catalog} />
        {items.length === 0 ? (
          <div className="empty">No items added yet.</div>
        ) : (
          <div>
            {items.map((item) => (
              <div className="row" key={item.id}>
                <span style={{ flex: 1, fontSize: "14px" }}>
                  {item.productName} <span style={{ color: "var(--text-dim)" }}>· {item.size}</span>
                </span>
                <span className="mono" style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                  {item.needed}
                </span>
                <form action={removePackingItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="icon-del" aria-label="Remove row">
                    ✕
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
        <form action={startPacking} style={{ marginTop: "14px" }}>
          <input type="hidden" name="batchId" value={batch.id} />
          <button type="submit" className="btn" disabled={items.length === 0}>
            Start packing
          </button>
        </form>
      </div>
    );
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
        <form action={resetBatch}>
          <input type="hidden" name="batchId" value={batch.id} />
          <button type="submit" className="btn ghost small">
            Reset all
          </button>
        </form>
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
                <form action={setItemRemaining} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="qty-btn"
                    name="remaining"
                    value={item.remaining - 1}
                    disabled={item.remaining <= 0}
                    aria-label="Decrement remaining"
                  >
                    −
                  </button>
                  <span className="packing-remaining">{item.remaining}</span>
                  <button
                    type="submit"
                    className="qty-btn"
                    name="remaining"
                    value={item.remaining + 1}
                    disabled={item.remaining >= item.needed}
                    aria-label="Increment remaining"
                  >
                    +
                  </button>
                </form>
                <form action={resetItem} style={{ marginLeft: "auto" }}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="btn ghost small">
                    Reset
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      <form action={completeBatch} style={{ marginTop: "18px" }}>
        <input type="hidden" name="batchId" value={batch.id} />
        <button type="submit" className="btn" disabled={!allDone}>
          Mark batch complete
        </button>
      </form>
    </div>
  );
}
