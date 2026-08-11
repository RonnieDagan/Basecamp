"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function parseSizes(raw: string): string[] {
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

export async function createCatalogProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const sizes = parseSizes(String(formData.get("sizes") ?? ""));

  await prisma.catalogProduct.create({ data: { name, sizes } });

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function updateCatalogProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const sizes = parseSizes(String(formData.get("sizes") ?? ""));

  await prisma.catalogProduct.update({ where: { id }, data: { name, sizes } });

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function deleteCatalogProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.catalogProduct.delete({ where: { id } });

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function startBatch() {
  const existing = await prisma.packingBatch.findFirst({
    where: { status: { in: ["Draft", "Active"] } },
  });
  if (existing) return;

  await prisma.packingBatch.create({ data: {} });

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function addPackingItem(formData: FormData) {
  const batchId = String(formData.get("batchId") ?? "");
  const productName = String(formData.get("productName") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const needed = Number(formData.get("needed") ?? 0);
  if (!batchId || !productName || !size || !Number.isFinite(needed) || needed <= 0) return;

  const batch = await prisma.packingBatch.findUnique({ where: { id: batchId } });
  if (!batch || batch.status !== "Draft") return;

  const roundedNeeded = Math.round(needed);
  await prisma.packingItem.create({
    data: { batchId, productName, size, needed: roundedNeeded, remaining: roundedNeeded },
  });

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function removePackingItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.packingItem.findUnique({ where: { id }, include: { batch: true } });
  if (!item || item.batch.status !== "Draft") return;

  await prisma.packingItem.delete({ where: { id } });

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function startPacking(formData: FormData) {
  const batchId = String(formData.get("batchId") ?? "");
  if (!batchId) return;

  const batch = await prisma.packingBatch.findUnique({ where: { id: batchId }, include: { items: true } });
  if (!batch || batch.status !== "Draft" || batch.items.length === 0) return;

  await prisma.packingBatch.update({ where: { id: batchId }, data: { status: "Active" } });

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function setItemRemaining(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const remaining = Number(formData.get("remaining") ?? NaN);
  if (!id || !Number.isFinite(remaining)) return;

  const item = await prisma.packingItem.findUnique({ where: { id } });
  if (!item) return;

  const clamped = Math.max(0, Math.min(item.needed, Math.round(remaining)));
  await prisma.packingItem.update({ where: { id }, data: { remaining: clamped } });

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function resetItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.packingItem.findUnique({ where: { id } });
  if (!item) return;

  await prisma.packingItem.update({ where: { id }, data: { remaining: item.needed } });

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function resetBatch(formData: FormData) {
  const batchId = String(formData.get("batchId") ?? "");
  if (!batchId) return;

  const items = await prisma.packingItem.findMany({ where: { batchId } });
  await Promise.all(
    items.map((item) =>
      prisma.packingItem.update({ where: { id: item.id }, data: { remaining: item.needed } })
    )
  );

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function completeBatch(formData: FormData) {
  const batchId = String(formData.get("batchId") ?? "");
  if (!batchId) return;

  const batch = await prisma.packingBatch.findUnique({ where: { id: batchId }, include: { items: true } });
  if (!batch || batch.status !== "Active") return;
  if (batch.items.length === 0 || batch.items.some((item) => item.remaining > 0)) return;

  await prisma.packingBatch.update({
    where: { id: batchId },
    data: { status: "Completed", completedAt: new Date() },
  });

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}
