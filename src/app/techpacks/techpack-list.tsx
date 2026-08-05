import { prisma } from "@/lib/prisma";
import { deleteTechpack, updateTechpack, deleteTechpackImage } from "./actions";
import { categoryLabels, statusLabels } from "@/lib/techpack-labels";
import { Linkify } from "@/components/linkify";
import { truncateFilename } from "@/lib/format";
import { TechpackImageUpload } from "./techpack-image-upload";

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function TechpackList() {
  const techpacks = await prisma.techpack.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });

  if (techpacks.length === 0) {
    return <div className="empty">No techpacks yet.</div>;
  }

  return (
    <div className="grid3">
      {techpacks.map((tp) => {
        const tagClass =
          tp.status === "UnderRevision" ? "tag-clay" : tp.status === "Active" ? "tag-moss" : "tag-dim";
        const coverImage = tp.images.find((img) => img.mimeType?.startsWith("image/"));

        return (
          <details className="card" key={tp.id}>
            <summary>
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage.blobUrl} alt="" className="techpack-thumb" />
              )}
              <div style={{ fontWeight: 500, fontSize: "14px" }}>{tp.name}</div>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                {categoryLabels[tp.category]} · {tp.version}
                {tp.images.length > 0 ? ` · ${tp.images.length} file${tp.images.length === 1 ? "" : "s"}` : ""}
              </div>
              <span className={`tag ${tagClass}`} style={{ marginTop: "10px", display: "inline-block" }}>
                {statusLabels[tp.status]}
              </span>
              {tp.notes && (
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "8px" }}>{tp.notes}</div>
              )}
            </summary>

            <div className="row-expanded">
              {tp.images.length > 0 && (
                <div className="techpack-gallery">
                  {tp.images.map((img) => {
                    const isImage = img.mimeType?.startsWith("image/");
                    return (
                      <div className="techpack-gallery-item" key={img.id}>
                        <a href={img.blobUrl} target="_blank" rel="noreferrer">
                          {isImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img.blobUrl} alt={img.filename} />
                          ) : (
                            <div className="file-fallback">
                              <span aria-hidden style={{ fontSize: "28px" }}>
                                📄
                              </span>
                              <span>{truncateFilename(img.filename)}</span>
                              <span>{formatFileSize(img.size)}</span>
                            </div>
                          )}
                        </a>
                        <form action={deleteTechpackImage}>
                          <input type="hidden" name="id" value={img.id} />
                          <button type="submit" className="remove-img">
                            ✕
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              )}

              <TechpackImageUpload techpackId={tp.id} />
              <div className="caption" style={{ marginBottom: "12px" }}>
                Images preview inline for inspiration/spec references (up to ~50MB each).
                Photoshop/Illustrator files show a file icon (browsers can&apos;t render .psd/.ai)
                with a download link.
              </div>

              <form action={updateTechpack}>
                <input type="hidden" name="id" value={tp.id} />
                <div className="form-grid">
                  <div className="field">
                    <label>Category</label>
                    <select name="category" defaultValue={tp.category}>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Version</label>
                    <input name="version" defaultValue={tp.version} />
                  </div>
                  <div className="field">
                    <label>Status</label>
                    <select name="status" defaultValue={tp.status}>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Materials / notes</label>
                  <Linkify text={tp.notes} />
                  <textarea name="notes" rows={4} defaultValue={tp.notes ?? ""} />
                </div>
                <button type="submit" className="btn small">
                  Save
                </button>
              </form>
              <form action={deleteTechpack} style={{ marginTop: "8px" }}>
                <input type="hidden" name="id" value={tp.id} />
                <button type="submit" className="btn ghost small">
                  Delete techpack
                </button>
              </form>
            </div>
          </details>
        );
      })}
    </div>
  );
}
