"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { FinanceType } from "@/generated/prisma/client";

export async function createFinanceItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const type = formData.get("type") as FinanceType;
  const dateRaw = String(formData.get("date") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.financeItem.create({
    data: {
      type,
      name,
      date: dateRaw ? new Date(dateRaw) : null,
      amount: amountRaw ? Number(amountRaw) : null,
      notes: notes || null,
    },
  });

  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

export async function updateFinanceItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const type = formData.get("type") as FinanceType;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.financeItem.update({
    where: { id },
    data: { type, amount: amountRaw ? Number(amountRaw) : null, notes: notes || null },
  });

  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

export async function deleteFinanceItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.financeItem.delete({ where: { id } });
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}
