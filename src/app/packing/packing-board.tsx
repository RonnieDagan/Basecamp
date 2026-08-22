import { prisma } from "@/lib/prisma";
import { startBatch, startPacking, removePackingItem } from "./actions";
import { AddItemForm } from "./add-item-form";
import { CsvImportForm } from "./csv-import-form";
import { PackingActiveView } from "./packing-active-view";

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

  return <PackingActiveView batchId={batch.id} items={items} />;
}
