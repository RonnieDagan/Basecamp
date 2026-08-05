"use client";

import { useRef, useTransition } from "react";
import { uploadTechpackImages } from "./actions";

export function TechpackImageUpload({ techpackId }: { techpackId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData: FormData) => {
        startTransition(async () => {
          await uploadTechpackImages(formData);
          formRef.current?.reset();
        });
      }}
      style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap", alignItems: "center" }}
    >
      <input type="hidden" name="techpackId" value={techpackId} />
      <input type="file" name="files" multiple disabled={uploading} />
      <button type="submit" className="btn small" disabled={uploading}>
        {uploading ? "Uploading…" : "Add images"}
      </button>
    </form>
  );
}
