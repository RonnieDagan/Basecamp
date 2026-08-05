import { prisma } from "@/lib/prisma";
import { ContentBoard } from "./content-board";

export async function ContentListLoader() {
  const posts = await prisma.post.findMany({ orderBy: { date: "desc" } });
  return <ContentBoard posts={posts} />;
}
