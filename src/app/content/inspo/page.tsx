import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import { ContentSubNav } from "../content-subnav";
import { FolderFormLoader } from "./folder-form-loader";
import { FolderList } from "./folder-list";

export const dynamic = "force-dynamic";

export default function InspoPage() {
  return (
    <div className="basecamp" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="wrap content-fade" style={{ paddingTop: 0 }}>
        <ContentSubNav />
        <Suspense fallback={<div className="empty">Loading…</div>}>
          <FolderFormLoader />
        </Suspense>
        <Suspense fallback={<div className="empty">Loading…</div>}>
          <FolderList />
        </Suspense>
      </main>
    </div>
  );
}
