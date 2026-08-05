import { prisma } from "@/lib/prisma";

function dateToIsoUTC(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

export async function ContentStats() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [postsThisMonth, ideaBacklog, postedDates] = await Promise.all([
    prisma.post.count({
      where: { status: "Posted", date: { gte: startOfMonth, lt: startOfNextMonth } },
    }),
    prisma.post.count({ where: { status: { in: ["Idea", "Scripted"] } } }),
    prisma.post.findMany({ where: { status: "Posted" }, select: { date: true } }),
  ]);

  const postedIsoSet = new Set(postedDates.map((p) => dateToIsoUTC(p.date)));
  let streak = 0;
  const cursor = new Date();
  while (postedIsoSet.has(dateToIsoUTC(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return (
    <div className="grid3" style={{ marginBottom: "20px" }}>
      <div className="stat">
        <div className="l">Posts this month</div>
        <div className="n">{postsThisMonth}</div>
      </div>
      <div className="stat">
        <div className="l">Current streak</div>
        <div className="n">{streak}</div>
      </div>
      <div className="stat">
        <div className="l">Idea backlog</div>
        <div className="n">{ideaBacklog}</div>
      </div>
    </div>
  );
}
