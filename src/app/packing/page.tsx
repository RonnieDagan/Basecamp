import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import { PackingBoard } from "./packing-board";
import { CatalogForm } from "./catalog-form";
import { CatalogList } from "./catalog-list";
import { PackingHistory } from "./packing-history";

export const dynamic = "force-dynamic";

const LOADING = <div className="empty">Loading…</div>;

export default function PackingPage() {
  return (
    <div className="basecamp" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="wrap content-fade" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2>Packing List</h2>
        </div>
        <Suspense fallback={LOADING}>
          <PackingBoard />
        </Suspense>

        <details className="card" style={{ marginTop: "20px" }}>
          <summary>
            <span style={{ fontWeight: 500, fontSize: "14px" }}>Manage product catalog</span>
          </summary>
          <div className="row-expanded" style={{ marginTop: "12px" }}>
            <CatalogForm />
            <Suspense fallback={LOADING}>
              <CatalogList />
            </Suspense>
          </div>
        </details>

        <details className="card" style={{ marginTop: "14px" }}>
          <summary>
            <span style={{ fontWeight: 500, fontSize: "14px" }}>History</span>
          </summary>
          <div className="row-expanded" style={{ marginTop: "12px" }}>
            <Suspense fallback={LOADING}>
              <PackingHistory />
            </Suspense>
          </div>
        </details>
      </main>
    </div>
  );
}
