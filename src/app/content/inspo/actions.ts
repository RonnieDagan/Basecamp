"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/file-storage";

export async function createFolder(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  if (!name || !category) return;
  const description = String(formData.get("description") ?? "").trim();

  await prisma.inspoFolder.create({
    data: { name, category, description: description || null },
  });

  revalidatePath("/content/inspo");
  revalidatePath("/dashboard");
}

export async function updateFolder(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  if (!name || !category) return;
  const description = String(formData.get("description") ?? "").trim();

  await prisma.inspoFolder.update({
    where: { id },
    data: { name, category, description: description || null },
  });

  revalidatePath("/content/inspo");
  revalidatePath("/dashboard");
}

export async function deleteFolder(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const items = await prisma.inspoItem.findMany({ where: { folderId: id } });
  await Promise.all(items.map((item) => deleteFile(item.url)));

  await prisma.inspoFolder.delete({ where: { id } });

  revalidatePath("/content/inspo");
  revalidatePath("/dashboard");
}

export async function uploadInspoMedia(formData: FormData) {
  const folderId = String(formData.get("folderId") ?? "");
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!folderId || files.length === 0) return;

  await Promise.all(
    files.map(async (file) => {
      const uploaded = await uploadFile(file);
      const type = uploaded.mimeType?.startsWith("video/") ? "Video" : "Image";
      await prisma.inspoItem.create({
        data: {
          folderId,
          type,
          url: uploaded.url,
          filename: uploaded.filename,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
        },
      });
    })
  );

  revalidatePath("/content/inspo");
  revalidatePath("/dashboard");
}

export async function addInspoLink(formData: FormData) {
  const folderId = String(formData.get("folderId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!folderId || !url) return;
  const label = String(formData.get("label") ?? "").trim();

  await prisma.inspoItem.create({
    data: {
      folderId,
      type: "Link",
      url: url.startsWith("http") ? url : `https://${url}`,
      label: label || null,
    },
  });

  revalidatePath("/content/inspo");
  revalidatePath("/dashboard");
}

export async function deleteInspoItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.inspoItem.findUnique({ where: { id } });
  if (item) {
    await deleteFile(item.url);
    await prisma.inspoItem.delete({ where: { id } });
  }

  revalidatePath("/content/inspo");
  revalidatePath("/dashboard");
}
