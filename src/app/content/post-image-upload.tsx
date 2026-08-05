"use client";

import { useRef, useTransition } from "react";
import { uploadPostImage, deletePostImage } from "./actions";

export function PostImageUpload({
  postId,
  imageUrl,
  imageFilename,
}: {
  postId: string;
  imageUrl: string | null;
  imageFilename: string | null;
}) {
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const [uploading, startTransition] = useTransition();

  return (
    <div>
      {imageUrl && (
        <div style={{ position: "relative", marginBottom: "8px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageFilename ?? "Post image"}
            style={{
              width: "100%",
              maxHeight: "420px",
              objectFit: "contain",
              borderRadius: "8px",
              background: "var(--ink)",
              border: "1px solid var(--line-strong)",
            }}
          />
          <form action={deletePostImage} style={{ position: "absolute", top: "8px", right: "8px" }}>
            <input type="hidden" name="id" value={postId} />
            <button type="submit" className="remove-img">
              ✕
            </button>
          </form>
        </div>
      )}
      <form
        ref={uploadFormRef}
        action={(formData: FormData) => {
          startTransition(async () => {
            await uploadPostImage(formData);
            uploadFormRef.current?.reset();
          });
        }}
        style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}
      >
        <input type="hidden" name="id" value={postId} />
        <input type="file" name="file" accept="image/*" disabled={uploading} />
        <button type="submit" className="btn small" disabled={uploading}>
          {uploading ? "Uploading…" : imageUrl ? "Replace image" : "Add image"}
        </button>
      </form>
    </div>
  );
}
