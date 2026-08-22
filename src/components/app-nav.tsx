import { Suspense } from "react";
import { logout } from "@/app/actions";
import { NavTabs } from "./nav-tabs";
import { ClockStats } from "./clock-stats";

export function AppNav() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <div className="wrap" style={{ paddingBottom: 0 }}>
        <div className="topbar">
          <div className="brand">
            <h1>Wandern Ops</h1>
            <p>Wandern Co. operations</p>
          </div>
          <div className="clock">
            <div>{today}</div>
            <Suspense fallback={<div className="mono">···</div>}>
              <ClockStats />
            </Suspense>
            <form action={logout} style={{ marginTop: "6px" }}>
              <button type="submit" className="btn ghost small">
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Rendered as a sibling (not nested in the short topbar wrap above) so its sticky
          containing block is the page's full-height wrapper, not just the topbar's box. */}
      <NavTabs />

      <div className="wrap" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="nav-hint">Drag a tab to reorder — the leftmost tab opens by default.</div>
      </div>
    </>
  );
}
