import { prisma } from "@/lib/prisma";

export async function ClockStats() {
  const [shipmentCount, openTaskCount] = await Promise.all([
    prisma.shipment.count(),
    prisma.task.count({ where: { status: { not: "Done" } } }),
  ]);

  return (
    <div className="mono">
      {shipmentCount} shipment{shipmentCount === 1 ? "" : "s"} · {openTaskCount} open task
      {openTaskCount === 1 ? "" : "s"}
    </div>
  );
}
