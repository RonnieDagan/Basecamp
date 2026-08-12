import { prisma } from "@/lib/prisma";
import { FolderForm } from "./folder-form";

export async function FolderFormLoader() {
  const folders = await prisma.inspoFolder.findMany({ select: { category: true } });
  const categories = Array.from(new Set(folders.map((f) => f.category))).sort();
  return <FolderForm categories={categories} />;
}
