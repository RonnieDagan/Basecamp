import { prisma } from "@/lib/prisma";
import { Timeline } from "./timeline";

export async function TimelineList() {
  const timelines = await prisma.timeline.findMany({
    orderBy: { createdAt: "desc" },
    include: { stages: { orderBy: { order: "asc" }, include: { attachments: true } } },
  });

  if (timelines.length === 0) {
    return <div className="empty">No timelines yet — add one above.</div>;
  }

  return (
    <>
      {timelines.map((t) => (
        <Timeline key={t.id} timeline={t} />
      ))}
    </>
  );
}
