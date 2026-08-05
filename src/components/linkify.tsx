const URL_PATTERN = /(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)/g;

function isUrl(part: string) {
  return /^(https?:\/\/|www\.)/i.test(part);
}

/** Read-only preview of free text with URLs rendered as clickable links, shown in full (no clipping). */
export function Linkify({ text }: { text: string | null | undefined }) {
  if (!text) return null;

  const parts = text.split(URL_PATTERN);

  return (
    <div
      className="caption"
      style={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        color: "var(--text-dim)",
        fontSize: "12px",
        marginBottom: "6px",
      }}
    >
      {parts.map((part, i) =>
        isUrl(part) ? (
          <a
            key={i}
            href={part.startsWith("http") ? part : `https://${part}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--moss-light)", textDecoration: "underline" }}
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
}
