import { prisma } from "@/lib/prisma";
import { ScratchpadEditor } from "./scratchpad-editor";

// The scratchpad used to store plain text. Now it stores the rich editor's HTML.
// Detect old plain-text content (no tags) and convert it once so line breaks and
// existing notes don't collapse into a single run-on line the first time this loads.
const LOOKS_LIKE_HTML = /<[a-z][\s\S]*>/i;

function legacyPlainTextToHtml(text: string): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .split(/\r\n|\r|\n/)
    .map((line) => `<div>${line || "<br>"}</div>`)
    .join("");
}

export async function Scratchpad() {
  const pad = await prisma.scratchpad.findFirst();

  const rawContent = pad?.content ?? "";
  const initialContent = LOOKS_LIKE_HTML.test(rawContent) ? rawContent : legacyPlainTextToHtml(rawContent);

  const savedLabel = pad?.updatedAt
    ? pad.updatedAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="card">
      <div className="section-head" style={{ marginBottom: "10px" }}>
        <h2 style={{ fontSize: "15px" }}>Scratchpad</h2>
      </div>
      <ScratchpadEditor initialContent={initialContent} savedLabel={savedLabel} />
    </div>
  );
}
