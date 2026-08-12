import { prisma } from "@/lib/prisma";
import { deleteFolder, updateFolder } from "./actions";
import { CategoryPicker } from "./category-picker";
import { MediaUpload } from "./media-upload";
import { Gallery } from "./gallery";
import { LinkSection } from "./link-section";
import { Linkify } from "@/components/linkify";
import { categoryColor } from "@/lib/category-color";

export async function FolderList() {
  const folders = await prisma.inspoFolder.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (folders.length === 0) {
    return <div className="empty">No inspo folders yet.</div>;
  }

  const allCategories = Array.from(new Set(folders.map((f) => f.category))).sort();

  return (
    <div className="grid3">
      {folders.map((folder) => {
        const media = folder.items
          .filter((i) => i.type === "Image" || i.type === "Video")
          .map((i) => ({ id: i.id, type: i.type as "Image" | "Video", url: i.url, filename: i.filename }));
        const links = folder.items
          .filter((i) => i.type === "Link")
          .map((i) => ({ id: i.id, url: i.url, label: i.label }));
        const cover = media.find((m) => m.type === "Image");
        const color = categoryColor(folder.category);

        return (
          <details className="card" key={folder.id}>
            <summary>
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover.url} alt="" className="techpack-thumb" />
              ) : (
                <div className="techpack-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="caption" style={{ marginTop: 0 }}>No images yet</span>
                </div>
              )}
              <div style={{ fontWeight: 500, fontSize: "14px" }}>{folder.name}</div>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                {media.length} file{media.length === 1 ? "" : "s"}
                {links.length > 0 ? ` · ${links.length} link${links.length === 1 ? "" : "s"}` : ""}
              </div>
              <span
                className="tag"
                style={{ background: `${color}2e`, color, marginTop: "10px", display: "inline-block" }}
              >
                {folder.category}
              </span>
              {folder.description && (
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "8px" }}>
                  {folder.description}
                </div>
              )}
            </summary>

            <div className="row-expanded">
              <Gallery items={media} />

              <div className="field">
                <label>Add images / videos</label>
                <MediaUpload folderId={folder.id} />
              </div>

              <div className="field">
                <label>Links</label>
                <LinkSection folderId={folder.id} links={links} />
              </div>

              <form action={updateFolder}>
                <input type="hidden" name="id" value={folder.id} />
                <div className="form-grid">
                  <div className="field">
                    <label>Folder name</label>
                    <input name="name" defaultValue={folder.name} required />
                  </div>
                  <CategoryPicker categories={allCategories} defaultValue={folder.category} />
                </div>
                <div className="field">
                  <label>Description</label>
                  <Linkify text={folder.description} />
                  <textarea name="description" rows={3} defaultValue={folder.description ?? ""} />
                </div>
                <button type="submit" className="btn small">
                  Save
                </button>
              </form>
              <form action={deleteFolder} style={{ marginTop: "8px" }}>
                <input type="hidden" name="id" value={folder.id} />
                <button type="submit" className="btn ghost small">
                  Delete folder
                </button>
              </form>
            </div>
          </details>
        );
      })}
    </div>
  );
}
