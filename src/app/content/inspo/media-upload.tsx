"use client";

import { useRef, useState, useTransition } from "react";
import { uploadInspoMedia } from "./actions";

export function MediaUpload({ folderId }: { folderId: string }) {
  const [pending, startTransition] = useTransition();
  const [pasteFlash, setPasteFlash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteZoneRef = useRef<HTMLDivElement>(null);

  function upload(files: File[]) {
    if (files.length === 0) return;
    const formData = new FormData();
    formData.set("folderId", folderId);
    for (const file of files) formData.append("files", file);
    startTransition(async () => {
      await uploadInspoMedia(formData);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of items) {
      if (item.kind === "file" && (item.type.startsWith("image/") || item.type.startsWith("video/"))) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      setPasteFlash(true);
      setTimeout(() => setPasteFlash(false), 400);
      upload(files);
    }
  }

  return (
    <div>
      <div
        ref={pasteZoneRef}
        className={`paste-zone${pasteFlash ? " flash" : ""}`}
        tabIndex={0}
        onPaste={handlePaste}
        onClick={() => pasteZoneRef.current?.focus()}
      >
        {pending ? "Uploading…" : "Click here, then paste an image (Ctrl/Cmd+V) — or choose a file below"}
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px", flexWrap: "wrap" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          disabled={pending}
          onChange={(e) => upload(Array.from(e.target.files ?? []))}
        />
      </div>
      <div className="caption">Images and videos, up to ~50MB each.</div>
    </div>
  );
}
