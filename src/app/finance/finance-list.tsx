import { prisma } from "@/lib/prisma";
import { deleteFinanceItem, updateFinanceItem } from "./actions";
import { typeLabels } from "@/lib/finance-labels";
import { Linkify } from "@/components/linkify";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function truncateText(text: string, max = 80) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export async function FinanceList() {
  const items = await prisma.financeItem.findMany({
    orderBy: { date: "asc" },
  });

  if (items.length === 0) {
    return <div className="empty">No finance items yet.</div>;
  }

  const now = new Date();

  return (
    <div>
      {items.map((f) => {
        const overdue = f.date !== null && f.date < now;
        return (
          <details className="row-details" key={f.id}>
            <summary>
              <span className="tag tag-dim" style={{ width: "130px", textAlign: "center" }}>
                {typeLabels[f.type]}
              </span>
              <span className="row-title-wrap">
                <span className="row-title">{f.name}</span>
                {f.notes && (
                  <span className="row-preview" style={{ maxWidth: "none" }}>
                    {truncateText(f.notes)}
                  </span>
                )}
              </span>
              {f.amount !== null && (
                <span
                  className="mono"
                  style={{ fontSize: "12px", color: overdue ? "var(--clay-light)" : "var(--moss-light)" }}
                >
                  ${f.amount.toLocaleString()}
                </span>
              )}
              <span
                className="mono"
                style={{
                  fontSize: "12px",
                  color: overdue ? "var(--clay-light)" : "var(--moss-light)",
                  width: "70px",
                  textAlign: "right",
                }}
              >
                {formatDate(f.date)}
              </span>
            </summary>

            <div className="row-expanded">
              <form action={updateFinanceItem}>
                <input type="hidden" name="id" value={f.id} />
                <div className="form-grid">
                  <div className="field">
                    <label>Type</label>
                    <select name="type" defaultValue={f.type}>
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Amount ($)</label>
                    <input name="amount" type="number" step="0.01" defaultValue={f.amount ?? ""} />
                  </div>
                </div>
                <div className="field">
                  <label>Notes</label>
                  <Linkify text={f.notes} />
                  <textarea name="notes" rows={4} defaultValue={f.notes ?? ""} />
                </div>
                <button type="submit" className="btn small">
                  Save
                </button>
              </form>
              <form action={deleteFinanceItem} style={{ marginTop: "8px" }}>
                <input type="hidden" name="id" value={f.id} />
                <button type="submit" className="btn ghost small">
                  Delete
                </button>
              </form>
            </div>
          </details>
        );
      })}
    </div>
  );
}
