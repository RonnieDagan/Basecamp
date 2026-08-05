import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import { TimelineForm } from "./timeline-form";
import { TimelineList } from "./timeline-list";

export const dynamic = "force-dynamic";

export default function TimelinesPage() {
  return (
    <div className="basecamp" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="wrap content-fade" style={{ paddingTop: 0 }}>
        <TimelineForm />
        <Suspense fallback={<div className="empty">Loading…</div>}>
          <TimelineList />
        </Suspense>
      </main>
    </div>
  );
}
