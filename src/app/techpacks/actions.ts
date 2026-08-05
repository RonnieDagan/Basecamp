"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TechpackCategory, TechpackStatus } from "@prisma/client";
import { uploadFile, deleteFile } from "@/lib/file-storage";

export async function createTechpack(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const category = formData.get("category") as TechpackCategory;
  const version = String(formData.get("version") ?? "").trim() || "v1";
  const status = formData.get("status") as TechpackStatus;
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.techpack.create({
    data: { name, category, version, status, notes: notes || null },
  });

  revalidatePath("/techpacks");
  revalidatePath("/dashboard");
}

export async function updateTechpack(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const category = formData.get("category") as TechpackCategory;
  const version = String(formData.get("version") ?? "").trim() || "v1";
  const status = formData.get("status") as TechpackStatus;
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.techpack.update({
    where: { id },
    data: { category, version, status, notes: notes || null },
  });

  revalidatePath("/techpacks");
  revalidatePath("/dashboard");
}

export async function deleteTechpack(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.techpack.delete({ where: { id } });
  revalidatePath("/techpacks");
  revalidatePath("/dashboard");
}

export async function uploadTechpackImages(formData: FormData) {
  const techpackId = String(formData.get("techpackId") ?? "");
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!techpackId || files.length === 0) return;

  await Promise.all(
    files.map(async (file) => {
      const uploaded = await uploadFile(file);
      await prisma.techpackImage.create({
        data: {
          techpackId,
          filename: uploaded.filename,
          blobUrl: uploaded.url,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
        },
      });
    })
  );

  revalidatePath("/techpacks");
  revalidatePath("/dashboard");
}

export async function deleteTechpackImage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const image = await prisma.techpackImage.findUnique({ where: { id } });
  if (image) {
    await deleteFile(image.blobUrl);
    await prisma.techpackImage.delete({ where: { id } });
  }

  revalidatePath("/techpacks");
  revalidatePath("/dashboard");
}
