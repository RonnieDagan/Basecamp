"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function saveScratchpad(formData: FormData) {
  const content = String(formData.get("content") ?? "");

  const existing = await prisma.scratchpad.findFirst();
  if (existing) {
    await prisma.scratchpad.update({ where: { id: existing.id }, data: { content } });
  } else {
    await prisma.scratchpad.create({ data: { content } });
  }

  revalidatePath("/dashboard");
}
