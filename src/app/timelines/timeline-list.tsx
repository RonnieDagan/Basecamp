import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Timeline } from "./timeline";

export async function TimelineList({ limit }: { limit?: number }) {
  const [timelines, totalCount] = await Promise.all([
    prisma.timeline.findMany({
      orderBy: { createdAt: "desc" },
      include: { stages: { orderBy: { order: "asc" }, include: { attachments: true } } },
      ...(limit ? { take: limit } : {}),
    }),
    limit ? prisma.timeline.count() : Promise.resolve(0),
  ]);

  if (timelines.length === 0) {
    return <div className="empty">No timelines yet — add one above.</div>;
  }

  return (
    <>
      {timelines.map((t) => (
        <Timeline key={t.id} timeline={t} />
      ))}
      {limit && totalCount > limit && (
        <div className="caption" style={{ marginTop: "4px" }}>
          Showing {limit} of {totalCount} —{" "}
          <Link href="/timelines" style={{ color: "var(--moss-light)" }}>
            view all timelines
          </Link>
        </div>
      )}
    </>
  );
}
