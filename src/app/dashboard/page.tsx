import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import { Scratchpad } from "@/components/scratchpad";
import { DashboardStats } from "./dashboard-stats";

import { TaskForm } from "../tasks/task-form";
import { TaskListLoader } from "../tasks/task-list-loader";

import { TimelineForm } from "../timelines/timeline-form";
import { TimelineList } from "../timelines/timeline-list";

import { ShipmentForm } from "../shipments/shipment-form";
import { ShipmentList } from "../shipments/shipment-list";

import { TechpackForm } from "../techpacks/techpack-form";
import { TechpackList } from "../techpacks/techpack-list";

import { PackingBoard } from "../packing/packing-board";

import { CaseForm } from "../cases/case-form";
import { CaseList } from "../cases/case-list";

import { ContentForm } from "../content/content-form";
import { ContentStats } from "../content/content-stats";
import { ContentListLoader } from "../content/content-list-loader";
import { FolderFormLoader } from "../content/inspo/folder-form-loader";
import { FolderList } from "../content/inspo/folder-list";

import { FinanceForm } from "../finance/finance-form";
import { FinanceList } from "../finance/finance-list";

export const dynamic = "force-dynamic";

function StatsSkeleton() {
  return (
    <div className="grid4">
      <div className="stat">
        <div className="l">Shipments</div>
        <div className="n">···</div>
      </div>
      <div className="stat">
        <div className="l">Open tasks</div>
        <div className="n">···</div>
      </div>
      <div className="stat">
        <div className="l">Open cases</div>
        <div className="n">···</div>
      </div>
      <div className="stat">
        <div className="l">Overdue tasks</div>
        <div className="n">···</div>
      </div>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--line-strong)" }}>
      {children}
    </div>
  );
}

const LOADING = <div className="empty">Loading…</div>;

export default function DashboardPage() {
  return (
    <div className="basecamp" style={{ minHeight: "100vh" }}>
      <AppNav />
      <main className="wrap content-fade" style={{ paddingTop: 0 }}>
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        <div style={{ marginTop: "20px" }}>
          <Suspense fallback={<div className="empty">Loading…</div>}>
            <Scratchpad />
          </Suspense>
        </div>

        <Section>
          <TaskForm />
          <Suspense fallback={LOADING}>
            <TaskListLoader />
          </Suspense>
        </Section>

        <Section>
          <TimelineForm />
          <Suspense fallback={LOADING}>
            <TimelineList />
          </Suspense>
        </Section>

        <Section>
          <ShipmentForm />
          <Suspense fallback={LOADING}>
            <ShipmentList />
          </Suspense>
        </Section>

        <Section>
          <TechpackForm />
          <Suspense fallback={LOADING}>
            <TechpackList />
          </Suspense>
        </Section>

        <Section>
          <div className="section-head">
            <h2>Packing List</h2>
          </div>
          <Suspense fallback={LOADING}>
            <PackingBoard />
          </Suspense>
        </Section>

        <Section>
          <CaseForm />
          <Suspense fallback={LOADING}>
            <CaseList />
          </Suspense>
        </Section>

        <Section>
          <ContentForm />
          <Suspense fallback={<StatsSkeleton />}>
            <ContentStats />
          </Suspense>
          <Suspense fallback={LOADING}>
            <ContentListLoader />
          </Suspense>
        </Section>

        <Section>
          <Suspense fallback={LOADING}>
            <FolderFormLoader />
          </Suspense>
          <Suspense fallback={LOADING}>
            <FolderList />
          </Suspense>
        </Section>

        <Section>
          <FinanceForm />
          <Suspense fallback={LOADING}>
            <FinanceList />
          </Suspense>
        </Section>
      </main>
    </div>
  );
}
