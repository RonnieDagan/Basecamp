import { prisma } from "@/lib/prisma";
import { deleteShipment, updateShipmentNotes, updateShipmentFlag } from "./actions";
import { Linkify } from "@/components/linkify";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function truncateText(text: string, max = 80) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export async function ShipmentList() {
  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (shipments.length === 0) {
    return <div className="empty">No shipments yet.</div>;
  }

  return (
    <div id="ship-list">
      {shipments.map((s) => (
        <details className="row-details" key={s.id}>
          <summary>
            <span
              className={`tag ${s.flagged ? "tag-clay" : "tag-moss"}`}
              style={{ width: "90px", textAlign: "center" }}
            >
              {s.flagged ? "Flagged" : "On track"}
            </span>
            <span className="row-title-wrap">
              <span className="row-title">{s.name}</span>
              {s.notes && (
                <span className="row-preview" style={{ maxWidth: "none" }}>
                  {truncateText(s.notes)}
                </span>
              )}
            </span>
            <span
              className="mono"
              style={{ fontSize: "12px", color: "var(--text-dim)", width: "140px" }}
            >
              {s.tracking || "no tracking #"}
            </span>
            <span
              className="mono"
              style={{ fontSize: "12px", color: "var(--text-dim)", width: "70px", textAlign: "right" }}
            >
              {formatDate(s.eta)}
            </span>
          </summary>

          <div className="row-expanded">
            <div className="field">
              <label>Notes</label>
              <Linkify text={s.notes} />
              <form action={updateShipmentNotes}>
                <input type="hidden" name="id" value={s.id} />
                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={s.notes ?? ""}
                  placeholder="Freight method, manufacturer, incoterm"
                />
                <button type="submit" className="btn small" style={{ marginTop: "8px" }}>
                  Save
                </button>
              </form>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <form action={updateShipmentFlag}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="flagged" value={s.flagged ? "" : "on"} />
                <button type="submit" className="btn ghost small">
                  {s.flagged ? "Clear flag" : "Flag for attention"}
                </button>
              </form>
              <form action={deleteShipment}>
                <input type="hidden" name="id" value={s.id} />
                <button type="submit" className="btn ghost small">
                  Delete
                </button>
              </form>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
