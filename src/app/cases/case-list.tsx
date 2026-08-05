import { prisma } from "@/lib/prisma";
import { deleteCase, updateCase } from "./actions";
import { issueLabels, resolutionLabels, statusLabels } from "@/lib/case-labels";
import { Linkify } from "@/components/linkify";

function truncateText(text: string, max = 80) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export async function CaseList() {
  const cases = await prisma.case.findMany({ orderBy: { createdAt: "desc" } });

  if (cases.length === 0) {
    return <div className="empty">No cases yet.</div>;
  }

  return (
    <div>
      {cases.map((c) => {
        const tagClass = c.status === "Open" ? "tag-clay" : c.status === "Escalated" ? "tag-amber" : "tag-moss";
        return (
          <details className="row-details" key={c.id}>
            <summary>
              <span className={`tag ${tagClass}`} style={{ width: "90px", textAlign: "center" }}>
                {statusLabels[c.status]}
              </span>
              <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "14px", flexShrink: 0 }}>{c.customer}</span>
                {c.notes && (
                  <span className="row-preview" style={{ maxWidth: "none" }}>
                    {truncateText(c.notes)}
                  </span>
                )}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-dim)", width: "140px" }}>
                {issueLabels[c.issue]}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-dim)", width: "120px" }}>
                {resolutionLabels[c.resolution]}
              </span>
            </summary>

            <div className="row-expanded">
              <form action={updateCase}>
                <input type="hidden" name="id" value={c.id} />
                <div className="form-grid">
                  <div className="field">
                    <label>Status</label>
                    <select name="status" defaultValue={c.status}>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Resolution</label>
                    <select name="resolution" defaultValue={c.resolution}>
                      {Object.entries(resolutionLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Notes</label>
                  <Linkify text={c.notes} />
                  <textarea name="notes" rows={4} defaultValue={c.notes ?? ""} />
                </div>
                <button type="submit" className="btn small">
                  Save
                </button>
              </form>
              <form action={deleteCase} style={{ marginTop: "8px" }}>
                <input type="hidden" name="id" value={c.id} />
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
