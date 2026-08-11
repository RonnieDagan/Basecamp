import { prisma } from "@/lib/prisma";
import { deleteCatalogProduct, updateCatalogProduct } from "./actions";

export async function CatalogList() {
  const products = await prisma.catalogProduct.findMany({ orderBy: { name: "asc" } });

  if (products.length === 0) {
    return <div className="empty">No catalog products yet.</div>;
  }

  return (
    <div>
      {products.map((p) => (
        <details className="row-details" key={p.id}>
          <summary>
            <span style={{ flex: 1, fontSize: "14px" }}>{p.name}</span>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
              {p.sizes.length > 0 ? p.sizes.join(", ") : "no sizes set"}
            </span>
          </summary>

          <div className="row-expanded">
            <form action={updateCatalogProduct}>
              <input type="hidden" name="id" value={p.id} />
              <div className="form-grid">
                <div className="field">
                  <label>Product name</label>
                  <input name="name" defaultValue={p.name} required />
                </div>
                <div className="field">
                  <label>Sizes (comma-separated)</label>
                  <input name="sizes" defaultValue={p.sizes.join(", ")} placeholder="XS, S, M, L, XL" />
                </div>
              </div>
              <button type="submit" className="btn small">
                Save
              </button>
            </form>
            <form action={deleteCatalogProduct} style={{ marginTop: "8px" }}>
              <input type="hidden" name="id" value={p.id} />
              <button type="submit" className="btn ghost small">
                Delete
              </button>
            </form>
          </div>
        </details>
      ))}
    </div>
  );
}
