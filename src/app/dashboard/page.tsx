import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import { Scratchpad } from "@/components/scratchpad";
import { CollapsibleSection } from "@/components/collapsible-section";
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

function Section({
  title,
  storageKey,
  children,
}: {
  title: string;
  storageKey: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--line-strong)" }}>
      <CollapsibleSection title={title} storageKey={storageKey}>
        {children}
      </CollapsibleSection>
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
          <CollapsibleSection title="Scratchpad" storageKey="scratchpad">
            <Suspense fallback={<div className="empty">Loading…</div>}>
              <Scratchpad />
            </Suspense>
          </CollapsibleSection>
        </div>

        <Section title="Tasks" storageKey="tasks">
          <TaskForm />
          <Suspense fallback={LOADING}>
            <TaskListLoader />
          </Suspense>
        </Section>

        <Section title="Timelines" storageKey="timelines">
          <TimelineForm />
          <Suspense fallback={LOADING}>
            <TimelineList limit={2} />
          </Suspense>
        </Section>

        <Section title="Shipments" storageKey="shipments">
          <ShipmentForm />
          <Suspense fallback={LOADING}>
            <ShipmentList />
          </Suspense>
        </Section>

        <Section title="Techpacks" storageKey="techpacks">
          <TechpackForm />
          <Suspense fallback={LOADING}>
            <TechpackList />
          </Suspense>
        </Section>

        <Section title="Packing List" storageKey="packing">
          <div className="section-head">
            <h2>Packing List</h2>
          </div>
          <Suspense fallback={LOADING}>
            <PackingBoard />
          </Suspense>
        </Section>

        <Section title="Cases" storageKey="cases">
          <CaseForm />
          <Suspense fallback={LOADING}>
            <CaseList />
          </Suspense>
        </Section>

        <Section title="Content" storageKey="content">
          <ContentForm />
          <Suspense fallback={<StatsSkeleton />}>
            <ContentStats />
          </Suspense>
          <Suspense fallback={LOADING}>
            <ContentListLoader />
          </Suspense>
        </Section>

        <Section title="Ideas & Photo Inspo" storageKey="inspo">
          <Suspense fallback={LOADING}>
            <FolderFormLoader />
          </Suspense>
          <Suspense fallback={LOADING}>
            <FolderList />
          </Suspense>
        </Section>

        <Section title="Finance" storageKey="finance">
          <FinanceForm />
          <Suspense fallback={LOADING}>
            <FinanceList />
          </Suspense>
        </Section>
      </main>
    </div>
  );
}
