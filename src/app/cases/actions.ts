"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CaseIssue, CaseResolution, CaseStatus } from "@prisma/client";

export async function createCase(formData: FormData) {
  const customer = String(formData.get("customer") ?? "").trim();
  if (!customer) return;

  const issue = formData.get("issue") as CaseIssue;
  const resolution = formData.get("resolution") as CaseResolution;
  const status = formData.get("status") as CaseStatus;
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.case.create({
    data: { customer, issue, resolution, status, notes: notes || null },
  });

  revalidatePath("/cases");
  revalidatePath("/dashboard");
}

export async function updateCase(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const resolution = formData.get("resolution") as CaseResolution;
  const status = formData.get("status") as CaseStatus;
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.case.update({
    where: { id },
    data: { resolution, status, notes: notes || null },
  });

  revalidatePath("/cases");
  revalidatePath("/dashboard");
}

export async function deleteCase(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.case.delete({ where: { id } });
  revalidatePath("/cases");
  revalidatePath("/dashboard");
}
