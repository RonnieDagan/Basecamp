import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import { FinanceForm } from "./finance-form";
import { FinanceList } from "./finance-list";

export const dynamic = "force-dynamic";

export default function FinancePage() {
  return (
    <div className="basecamp" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="wrap content-fade" style={{ paddingTop: 0 }}>
        <FinanceForm />
        <Suspense fallback={<div className="empty">Loading…</div>}>
          <FinanceList />
        </Suspense>
      </main>
    </div>
  );
}
