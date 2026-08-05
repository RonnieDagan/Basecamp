import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import { ContentForm } from "./content-form";
import { ContentStats } from "./content-stats";
import { ContentListLoader } from "./content-list-loader";

export const dynamic = "force-dynamic";

function StatsSkeleton() {
  return (
    <div className="grid3" style={{ marginBottom: "20px" }}>
      <div className="stat">
        <div className="l">Posts this month</div>
        <div className="n">···</div>
      </div>
      <div className="stat">
        <div className="l">Current streak</div>
        <div className="n">···</div>
      </div>
      <div className="stat">
        <div className="l">Idea backlog</div>
        <div className="n">···</div>
      </div>
    </div>
  );
}

export default function ContentPage() {
  return (
    <div className="basecamp" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="wrap content-fade" style={{ paddingTop: 0 }}>
        <ContentForm />
        <Suspense fallback={<StatsSkeleton />}>
          <ContentStats />
        </Suspense>
        <Suspense fallback={<div className="empty">Loading…</div>}>
          <ContentListLoader />
        </Suspense>
      </main>
    </div>
  );
}
