import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import { ShipmentForm } from "./shipment-form";
import { ShipmentList } from "./shipment-list";

export const dynamic = "force-dynamic";

export default function ShipmentsPage() {
  return (
    <div className="basecamp" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="wrap content-fade" style={{ paddingTop: 0 }}>
        <ShipmentForm />
        <Suspense fallback={<div className="empty">Loading…</div>}>
          <ShipmentList />
        </Suspense>
      </main>
    </div>
  );
}
