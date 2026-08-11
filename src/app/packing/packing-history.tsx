import { prisma } from "@/lib/prisma";
import { deletePackingBatch } from "./actions";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export async function PackingHistory() {
  const batches = await prisma.packingBatch.findMany({
    where: { status: "Completed" },
    orderBy: { completedAt: "desc" },
    include: { items: true },
  });

  if (batches.length === 0) {
    return <div className="empty">No completed packing lists yet.</div>;
  }

  return (
    <div>
      {batches.map((b) => {
        const totalUnits = b.items.reduce((sum, i) => sum + i.needed, 0);
        return (
          <div className="row" key={b.id}>
            <span className="mono" style={{ fontSize: "13px", width: "110px" }}>
              {b.completedAt ? formatDate(b.completedAt) : "—"}
            </span>
            <span style={{ flex: 1, fontSize: "13px", color: "var(--text-dim)" }}>
              {b.items.length} item{b.items.length === 1 ? "" : "s"} · {totalUnits} unit
              {totalUnits === 1 ? "" : "s"} packed
            </span>
            <form action={deletePackingBatch}>
              <input type="hidden" name="id" value={b.id} />
              <button type="submit" className="icon-del" aria-label="Delete from history">
                ✕
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
