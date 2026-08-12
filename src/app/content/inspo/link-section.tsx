"use client";

import { useRef, useState, useTransition } from "react";
import { addInspoLink, deleteInspoItem } from "./actions";

type LinkItem = { id: string; url: string; label: string | null };

export function LinkSection({ folderId, links }: { folderId: string; links: LinkItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  return (
    <div>
      {links.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          {links.map((link) => (
            <div className="file-chip" key={link.id}>
              <a href={link.url} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>
                🔗 {link.label || link.url}
              </a>
              <form action={deleteInspoItem} style={{ display: "inline" }}>
                <input type="hidden" name="id" value={link.id} />
                <button type="submit" className="icon-del" style={{ padding: "0 2px" }} aria-label="Remove link">
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
      <form
        key={resetKey}
        ref={formRef}
        action={(formData: FormData) => {
          startTransition(async () => {
            await addInspoLink(formData);
            setResetKey((k) => k + 1);
          });
        }}
        style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end" }}
      >
        <input type="hidden" name="folderId" value={folderId} />
        <div className="field" style={{ flex: "2 1 200px", marginBottom: 0 }}>
          <label>Link URL</label>
          <input name="url" required placeholder="https://…" />
        </div>
        <div className="field" style={{ flex: "1 1 140px", marginBottom: 0 }}>
          <label>Label</label>
          <input name="label" placeholder="Optional" />
        </div>
        <button type="submit" className="btn small" disabled={pending}>
          {pending ? "Adding…" : "+ Add link"}
        </button>
      </form>
    </div>
  );
}
