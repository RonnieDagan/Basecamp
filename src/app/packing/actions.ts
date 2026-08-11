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

type ImportRow = { productName: string; size: string; needed: number };

async function createItemsForBatch(batchId: string, rows: ImportRow[]) {
  const clean = rows.filter(
    (r) => r.productName && r.size && Number.isFinite(r.needed) && r.needed > 0
  );
  if (clean.length === 0) return 0;

  await prisma.packingItem.createMany({
    data: clean.map((r) => ({
      batchId,
      productName: r.productName,
      size: r.size,
      needed: Math.round(r.needed),
      remaining: Math.round(r.needed),
    })),
  });

  return clean.length;
}

async function upsertCatalogFromRows(rows: ImportRow[]) {
  const sizesByProduct = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!r.productName || !r.size) continue;
    if (!sizesByProduct.has(r.productName)) sizesByProduct.set(r.productName, new Set());
    sizesByProduct.get(r.productName)!.add(r.size);
  }
  const names = Array.from(sizesByProduct.keys());
  if (names.length === 0) return;

  const existing = await prisma.catalogProduct.findMany({ where: { name: { in: names } } });
  const existingByName = new Map(existing.map((c) => [c.name, c]));

  await Promise.all(
    names.map(async (name) => {
      const sizes = Array.from(sizesByProduct.get(name)!);
      const existingProduct = existingByName.get(name);
      if (!existingProduct) {
        await prisma.catalogProduct.create({ data: { name, sizes } });
      } else {
        const merged = Array.from(new Set([...existingProduct.sizes, ...sizes]));
        if (merged.length !== existingProduct.sizes.length) {
          await prisma.catalogProduct.update({ where: { id: existingProduct.id }, data: { sizes: merged } });
        }
      }
    })
  );
}

export async function createCatalogProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const sizes = parseSizes(String(formData.get("sizes") ?? ""));

  const existing = await prisma.catalogProduct.findUnique({ where: { name } });
  if (existing) {
    const merged = Array.from(new Set([...existing.sizes, ...sizes]));
    await prisma.catalogProduct.update({ where: { id: existing.id }, data: { sizes: merged } });
  } else {
    await prisma.catalogProduct.create({ data: { name, sizes } });
  }

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function updateCatalogProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const sizes = parseSizes(String(formData.get("sizes") ?? ""));

  const conflict = await prisma.catalogProduct.findUnique({ where: { name } });
  if (conflict && conflict.id !== id) return;

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

export async function addPackingItems(formData: FormData) {
  const batchId = String(formData.get("batchId") ?? "");
  const productName = String(formData.get("productName") ?? "").trim();
  const itemsJson = String(formData.get("itemsJson") ?? "");
  if (!batchId || !productName || !itemsJson) return;

  const batch = await prisma.packingBatch.findUnique({ where: { id: batchId } });
  if (!batch || batch.status !== "Draft") return;

  let parsed: Array<{ size: string; needed: number }>;
  try {
    parsed = JSON.parse(itemsJson);
  } catch {
    return;
  }
  if (!Array.isArray(parsed)) return;

  await createItemsForBatch(
    batchId,
    parsed.map((r) => ({ productName, size: String(r.size ?? "").trim(), needed: Number(r.needed) }))
  );

  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

export async function importCsv(formData: FormData) {
  const file = formData.get("file");
  let text = "";
  if (file instanceof File && file.size > 0) {
    text = await file.text();
  } else {
    text = String(formData.get("csvText") ?? "");
  }
  text = text.trim();
  if (!text) return;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return;

  const firstCols = lines[0].split(",");
  const startIdx = Number.isFinite(Number(firstCols[2]?.trim())) ? 0 : 1;

  const rows: ImportRow[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 3) continue;
    const productName = cols[0].trim();
    const size = cols[1].trim();
    const needed = Number(cols[2].trim());
    if (!productName || !size || !Number.isFinite(needed) || needed <= 0) continue;
    rows.push({ productName, size, needed });
  }
  if (rows.length === 0) return;

  let batch = await prisma.packingBatch.findFirst({ where: { status: { in: ["Draft", "Active"] } } });
  if (!batch) {
    batch = await prisma.packingBatch.create({ data: {} });
  } else if (batch.status !== "Draft") {
    return;
  }

  await createItemsForBatch(batch.id, rows);
  await upsertCatalogFromRows(rows);

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

export async function deletePackingBatch(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const batch = await prisma.packingBatch.findUnique({ where: { id } });
  if (!batch || batch.status !== "Completed") return;

  await prisma.packingBatch.delete({ where: { id } });

  revalidatePath("/packing");
}
