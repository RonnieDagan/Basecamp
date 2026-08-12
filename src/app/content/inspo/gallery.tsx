"use client";

import { useState } from "react";
import { deleteInspoItem } from "./actions";

type MediaItem = {
  id: string;
  type: "Image" | "Video";
  url: string;
  filename: string | null;
};

export function Gallery({ items }: { items: MediaItem[] }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const lightboxItem = items.find((i) => i.url === lightboxUrl) ?? null;

  if (items.length === 0) return null;

  return (
    <>
      <div className="techpack-gallery">
        {items.map((item) => (
          <div className="techpack-gallery-item" key={item.id}>
            {item.type === "Image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.filename ?? ""}
                onClick={() => setLightboxUrl(item.url)}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setLightboxUrl(item.url)}>
                <video src={item.url} muted style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
                <span className="video-badge">▶</span>
              </div>
            )}
            <form action={deleteInspoItem}>
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" className="remove-img" aria-label="Delete">
                ✕
              </button>
            </form>
          </div>
        ))}
      </div>

      {lightboxItem && (
        <div className="lightbox-overlay" onClick={() => setLightboxUrl(null)}>
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close preview"
          >
            ✕
          </button>
          {lightboxItem.type === "Image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lightboxItem.url} alt={lightboxItem.filename ?? ""} className="lightbox-media" />
          ) : (
            <video
              src={lightboxItem.url}
              className="lightbox-media"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
}
