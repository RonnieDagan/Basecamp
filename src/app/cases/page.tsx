import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import { CaseForm } from "./case-form";
import { CaseList } from "./case-list";

export const dynamic = "force-dynamic";

export default function CasesPage() {
  return (
    <div className="basecamp" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="wrap content-fade" style={{ paddingTop: 0 }}>
        <CaseForm />
        <Suspense fallback={<div className="empty">Loading…</div>}>
          <CaseList />
        </Suspense>
      </main>
    </div>
  );
}
