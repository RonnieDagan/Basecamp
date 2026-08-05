"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Platform, PostType, PostStatus } from "@prisma/client";
import { uploadFile, deleteFile } from "@/lib/file-storage";

export async function createPost(formData: FormData) {
  const dateRaw = String(formData.get("date") ?? "");
  if (!dateRaw) return;

  const platform = formData.get("platform") as Platform;
  const type = formData.get("type") as PostType;
  const status = formData.get("status") as PostStatus;
  const product = String(formData.get("product") ?? "").trim();
  const partner = String(formData.get("partner") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.post.create({
    data: {
      platform,
      type,
      status,
      date: new Date(dateRaw),
      product: product || null,
      partner: partner || null,
      notes: notes || null,
    },
  });

  revalidatePath("/content");
  revalidatePath("/dashboard");
}

export async function updatePost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const status = formData.get("status") as PostStatus;
  const product = String(formData.get("product") ?? "").trim();
  const partner = String(formData.get("partner") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.post.update({
    where: { id },
    data: { status, product: product || null, partner: partner || null, notes: notes || null },
  });

  revalidatePath("/content");
  revalidatePath("/dashboard");
}

export async function deletePost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const post = await prisma.post.findUnique({ where: { id } });
  if (post?.imageUrl) await deleteFile(post.imageUrl);

  await prisma.post.delete({ where: { id } });
  revalidatePath("/content");
  revalidatePath("/dashboard");
}

export async function uploadPostImage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");
  if (!id || !(file instanceof File) || file.size === 0) return;

  const existing = await prisma.post.findUnique({ where: { id } });
  if (existing?.imageUrl) await deleteFile(existing.imageUrl);

  const uploaded = await uploadFile(file);
  await prisma.post.update({
    where: { id },
    data: { imageUrl: uploaded.url, imageFilename: uploaded.filename },
  });

  revalidatePath("/content");
  revalidatePath("/dashboard");
}

export async function deletePostImage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const post = await prisma.post.findUnique({ where: { id } });
  if (post?.imageUrl) await deleteFile(post.imageUrl);

  await prisma.post.update({ where: { id }, data: { imageUrl: null, imageFilename: null } });
  revalidatePath("/content");
  revalidatePath("/dashboard");
}
