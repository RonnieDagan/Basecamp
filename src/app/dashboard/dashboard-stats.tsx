import { prisma } from "@/lib/prisma";

export async function DashboardStats() {
  const now = new Date();
  const [shipmentCount, openTaskCount, openCaseCount, overdueTaskCount] = await Promise.all([
    prisma.shipment.count(),
    prisma.task.count({ where: { status: { not: "Done" } } }),
    prisma.case.count({ where: { status: { not: "Resolved" } } }),
    prisma.task.count({ where: { status: { not: "Done" }, dueDate: { lt: now } } }),
  ]);

  return (
    <div className="grid4">
      <div className="stat">
        <div className="l">Shipments</div>
        <div className="n">{shipmentCount}</div>
      </div>
      <div className="stat">
        <div className="l">Open tasks</div>
        <div className="n">{openTaskCount}</div>
      </div>
      <div className="stat">
        <div className="l">Open cases</div>
        <div className="n">{openCaseCount}</div>
      </div>
      <div className="stat">
        <div className="l">Overdue tasks</div>
        <div
          className="n"
          style={{ color: overdueTaskCount > 0 ? "var(--clay-light)" : "var(--paper)" }}
        >
          {overdueTaskCount}
        </div>
      </div>
    </div>
  );
}
