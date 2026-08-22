"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Domain, Priority, TaskStatus } from "@prisma/client";

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const description = String(formData.get("description") ?? "").trim();
  const domain = formData.get("domain") as Domain;
  const priority = formData.get("priority") as Priority;
  const dueDateRaw = String(formData.get("dueDate") ?? "");

  await prisma.task.create({
    data: {
      title,
      description: description || null,
      domain,
      priority,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = formData.get("status") as TaskStatus;
  if (!id || !status) return;

  await prisma.task.update({ where: { id }, data: { status } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskDescription(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const description = String(formData.get("description") ?? "").trim();

  await prisma.task.update({ where: { id }, data: { description: description || null } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function reorderTasks(formData: FormData) {
  const raw = String(formData.get("updates") ?? "[]");
  let updates: Array<{ id: string; order: number }>;
  try {
    updates = JSON.parse(raw);
  } catch {
    return;
  }
  if (!Array.isArray(updates) || updates.length === 0) return;

  await prisma.$transaction(
    updates
      .filter((u) => u && typeof u.id === "string" && Number.isFinite(u.order))
      .map((u) => prisma.task.update({ where: { id: u.id }, data: { order: u.order } }))
  );

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createDivider(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;

  await prisma.taskDivider.create({ data: { label, order: Date.now() } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateDividerOrder(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const order = Number(formData.get("order") ?? NaN);
  if (!id || !Number.isFinite(order)) return;

  await prisma.taskDivider.update({ where: { id }, data: { order } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteDivider(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.taskDivider.delete({ where: { id } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
