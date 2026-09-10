"use client";

import { useState } from "react";

export function ImageThumb({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ cursor: "pointer", ...style }}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      />
      {open && (
        <div className="lightbox-overlay" onClick={() => setOpen(false)}>
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setOpen(false)}
            aria-label="Close preview"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="lightbox-media" />
        </div>
      )}
    </>
  );
}
