"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { StageStatus } from "@prisma/client";
import { STAGE_NAMES } from "@/lib/stages";
import { uploadFile, deleteFile } from "@/lib/file-storage";

export async function createTimeline(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const notes = String(formData.get("notes") ?? "").trim();
  const flagged = formData.get("flagged") === "on";

  await prisma.timeline.create({
    data: {
      name,
      notes: notes || null,
      flagged,
      stages: {
        create: STAGE_NAMES.map((stageName, i) => ({
          name: stageName,
          order: i,
          status: i === 0 ? "Current" : "Pending",
        })),
      },
    },
  });

  revalidatePath("/timelines");
  revalidatePath("/dashboard");
}

export async function deleteTimeline(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.timeline.delete({ where: { id } });
  revalidatePath("/timelines");
  revalidatePath("/dashboard");
}

export async function updateTimelineFlag(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const flagged = formData.get("flagged") === "on";

  await prisma.timeline.update({ where: { id }, data: { flagged } });
  revalidatePath("/timelines");
  revalidatePath("/dashboard");
}

export async function updateTimelineNotes(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.timeline.update({ where: { id }, data: { notes: notes || null } });
  revalidatePath("/timelines");
}

export async function updateStageStatus(formData: FormData) {
  const stageId = String(formData.get("stageId") ?? "");
  const status = formData.get("status") as StageStatus;
  if (!stageId || !status) return;

  await prisma.timelineStage.update({ where: { id: stageId }, data: { status } });
  revalidatePath("/timelines");
  revalidatePath("/dashboard");
}

export async function updateStageNotes(formData: FormData) {
  const stageId = String(formData.get("stageId") ?? "");
  if (!stageId) return;
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.timelineStage.update({ where: { id: stageId }, data: { notes: notes || null } });
  revalidatePath("/timelines");
}

export async function uploadAttachment(formData: FormData) {
  const stageId = String(formData.get("stageId") ?? "");
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (!stageId || files.length === 0) return;

  await Promise.all(
    files.map(async (file) => {
      const uploaded = await uploadFile(file);
      await prisma.attachment.create({
        data: {
          timelineStageId: stageId,
          filename: uploaded.filename,
          blobUrl: uploaded.url,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
        },
      });
    })
  );

  revalidatePath("/timelines");
}

export async function deleteAttachment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (attachment) {
    await deleteFile(attachment.blobUrl);
    await prisma.attachment.delete({ where: { id } });
  }

  revalidatePath("/timelines");
}
