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
