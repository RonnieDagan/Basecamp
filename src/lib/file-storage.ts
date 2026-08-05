import { put, del } from "@vercel/blob";

export type UploadedFile = {
  url: string;
  filename: string;
  mimeType: string | null;
  size: number;
};

/**
 * Uses real Vercel Blob storage when BLOB_READ_WRITE_TOKEN is configured.
 * Otherwise falls back to embedding the file as a base64 data URI so uploads
 * still work end-to-end without needing a Blob store connected first. Once a
 * token is added, new uploads switch to real Blob storage automatically —
 * files already stored as data URIs keep working either way.
 */
export async function uploadFile(file: File): Promise<UploadedFile> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(file.name, file, { access: "public", addRandomSuffix: true });
    return { url: blob.url, filename: file.name, mimeType: file.type || null, size: file.size };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const url = `data:${mimeType};base64,${buffer.toString("base64")}`;
  return { url, filename: file.name, mimeType: file.type || null, size: file.size };
}

export async function deleteFile(url: string): Promise<void> {
  if (url.startsWith("data:")) return;
  await del(url).catch(() => {});
}
