"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function saveScratchpad(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const content = String(formData.get("content") ?? "");
  if (!id) return;

  await prisma.scratchpad.update({ where: { id }, data: { content } });
  revalidatePath("/dashboard");
}

export async function createScratchpad() {
  await prisma.scratchpad.create({ data: { content: "", label: "Scratchpad" } });
  revalidatePath("/dashboard");
}

export async function renameScratchpad(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  if (!id || !label) return;

  await prisma.scratchpad.update({ where: { id }, data: { label } });
  revalidatePath("/dashboard");
}

export async function deleteScratchpad(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.scratchpad.delete({ where: { id } });
  revalidatePath("/dashboard");
}
