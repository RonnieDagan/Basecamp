import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import { TechpackForm } from "./techpack-form";
import { TechpackList } from "./techpack-list";

export const dynamic = "force-dynamic";

export default function TechpacksPage() {
  return (
    <div className="basecamp" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="wrap content-fade" style={{ paddingTop: 0 }}>
        <TechpackForm />
        <Suspense fallback={<div className="empty">Loading…</div>}>
          <TechpackList />
        </Suspense>
      </main>
    </div>
  );
}
