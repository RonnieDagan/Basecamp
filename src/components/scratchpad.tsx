import { prisma } from "@/lib/prisma";
import { ScratchpadEditor } from "./scratchpad-editor";
import { createScratchpad, renameScratchpad, deleteScratchpad } from "./scratchpad-actions";

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
  const pads = await prisma.scratchpad.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      {pads.map((pad) => {
        const rawContent = pad.content ?? "";
        const initialContent = LOOKS_LIKE_HTML.test(rawContent) ? rawContent : legacyPlainTextToHtml(rawContent);
        const savedLabel = pad.updatedAt.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

        return (
          <div className="card" key={pad.id} style={{ marginBottom: "14px" }}>
            <div className="section-head" style={{ marginBottom: "10px" }}>
              <form action={renameScratchpad} style={{ flex: 1, minWidth: 0 }}>
                <input type="hidden" name="id" value={pad.id} />
                <input
                  name="label"
                  defaultValue={pad.label}
                  className="scratchpad-label-input"
                  aria-label="Scratchpad name"
                />
              </form>
              <form action={deleteScratchpad}>
                <input type="hidden" name="id" value={pad.id} />
                <button type="submit" className="icon-del" aria-label="Delete scratchpad">
                  ✕
                </button>
              </form>
            </div>
            <ScratchpadEditor id={pad.id} initialContent={initialContent} savedLabel={savedLabel} />
          </div>
        );
      })}

      <form action={createScratchpad}>
        <button type="submit" className="btn ghost small">
          + Add scratchpad
        </button>
      </form>
    </>
  );
}
