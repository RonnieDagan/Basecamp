"use client";

import { useRef, useState } from "react";
import { saveScratchpad } from "./scratchpad-actions";

// Properties that must be mirrored onto an offscreen div so its text wraps
// identically to the textarea, letting us measure where a character lands.
const MIRROR_PROPERTIES = [
  "direction",
  "box-sizing",
  "width",
  "overflow-x",
  "overflow-y",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-style",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "font-style",
  "font-variant",
  "font-weight",
  "font-stretch",
  "font-size",
  "line-height",
  "font-family",
  "text-align",
  "text-transform",
  "text-indent",
  "letter-spacing",
  "word-spacing",
  "tab-size",
];

function getCaretCoordinates(textarea: HTMLTextAreaElement, position: number) {
  const mirror = document.createElement("div");
  const computed = window.getComputedStyle(textarea);
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.top = "0px";
  mirror.style.left = "-9999px";
  for (const prop of MIRROR_PROPERTIES) {
    mirror.style.setProperty(prop, computed.getPropertyValue(prop));
  }
  document.body.appendChild(mirror);

  mirror.textContent = textarea.value.slice(0, position);
  const marker = document.createElement("span");
  marker.textContent = textarea.value.slice(position) || ".";
  mirror.appendChild(marker);

  const top = marker.offsetTop;
  const left = marker.offsetLeft;
  document.body.removeChild(mirror);
  return { top, left };
}

function wrapSelection(value: string, start: number, end: number, marker: string) {
  const before = value.slice(Math.max(0, start - marker.length), start);
  const after = value.slice(end, end + marker.length);
  if (before === marker && after === marker) {
    return {
      value: value.slice(0, start - marker.length) + value.slice(start, end) + value.slice(end + marker.length),
      start: start - marker.length,
      end: end - marker.length,
    };
  }
  return {
    value: value.slice(0, start) + marker + value.slice(start, end) + marker + value.slice(end),
    start: start + marker.length,
    end: end + marker.length,
  };
}

function toggleLinePrefix(value: string, start: number, end: number, prefix: string) {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = value.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const allPrefixed = lines.every((l) => l.startsWith(prefix));
  const newLines = lines.map((l) => (allPrefixed ? l.slice(prefix.length) : prefix + l));
  const newBlock = newLines.join("\n");
  return {
    value: value.slice(0, lineStart) + newBlock + value.slice(lineEnd),
    start: lineStart,
    end: lineStart + newBlock.length,
  };
}

function insertLink(value: string, start: number, end: number, url: string) {
  const selected = value.slice(start, end) || "link text";
  const inserted = `[${selected}](${url})`;
  const caret = start + inserted.length;
  return { value: value.slice(0, start) + inserted + value.slice(end), start: caret, end: caret };
}

type ToolbarState = { visible: boolean; top: number; left: number; mode: "format" | "link" };

const noPropagateMouseDown = (e: React.MouseEvent) => e.preventDefault();

export function ScratchpadEditor({
  initialContent,
  savedLabel,
}: {
  initialContent: string;
  savedLabel: string | null;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<{ start: number; end: number } | null>(null);
  const [toolbar, setToolbar] = useState<ToolbarState>({ visible: false, top: 0, left: 0, mode: "format" });
  const [linkUrl, setLinkUrl] = useState("");

  function updateToolbarFromSelection() {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    if (start === end) {
      setToolbar((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    const coords = getCaretCoordinates(ta, start);
    const rect = ta.getBoundingClientRect();
    setToolbar({
      visible: true,
      top: rect.top + coords.top - ta.scrollTop,
      left: rect.left + coords.left - ta.scrollLeft,
      mode: "format",
    });
  }

  function commit(ta: HTMLTextAreaElement, result: { value: string; start: number; end: number }) {
    ta.value = result.value;
    ta.selectionStart = result.start;
    ta.selectionEnd = result.end;
    ta.focus();
    requestAnimationFrame(updateToolbarFromSelection);
  }

  function applyWrap(marker: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    commit(ta, wrapSelection(ta.value, ta.selectionStart, ta.selectionEnd, marker));
  }

  function applyLinePrefix(prefix: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    commit(ta, toggleLinePrefix(ta.value, ta.selectionStart, ta.selectionEnd, prefix));
  }

  function openLinkInput() {
    const ta = textareaRef.current;
    if (!ta) return;
    savedSelection.current = { start: ta.selectionStart, end: ta.selectionEnd };
    setLinkUrl("");
    setToolbar((t) => ({ ...t, mode: "link" }));
  }

  function confirmLink() {
    const ta = textareaRef.current;
    const sel = savedSelection.current;
    const url = linkUrl.trim();
    if (ta && sel && url) {
      commit(ta, insertLink(ta.value, sel.start, sel.end, url));
    }
    setToolbar((t) => ({ ...t, visible: false, mode: "format" }));
  }

  function handleTextareaBlur(e: React.FocusEvent<HTMLTextAreaElement>) {
    const next = e.relatedTarget as Node | null;
    if (next && toolbarRef.current?.contains(next)) return;
    setToolbar((t) => ({ ...t, visible: false }));
  }

  function handleLinkInputBlur(e: React.FocusEvent<HTMLInputElement>) {
    const next = e.relatedTarget as Node | null;
    if (next && toolbarRef.current?.contains(next)) return;
    setToolbar((t) => ({ ...t, visible: false }));
  }

  return (
    <form action={saveScratchpad} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <textarea
        ref={textareaRef}
        name="content"
        className="scratchpad-textarea"
        rows={8}
        defaultValue={initialContent}
        placeholder="Quick notes, ideas, things to remember — highlight text to format it."
        onSelect={updateToolbarFromSelection}
        onKeyUp={updateToolbarFromSelection}
        onBlur={handleTextareaBlur}
      />

      {toolbar.visible && (
        <div
          ref={toolbarRef}
          className="md-toolbar"
          style={{ top: toolbar.top, left: toolbar.left }}
          onMouseDown={(e) => {
            if (toolbar.mode === "format") e.preventDefault();
          }}
        >
          {toolbar.mode === "format" ? (
            <>
              <button type="button" className="md-btn" style={{ fontWeight: 700 }} onClick={() => applyWrap("**")}>
                B
              </button>
              <button type="button" className="md-btn" style={{ fontStyle: "italic" }} onClick={() => applyWrap("_")}>
                I
              </button>
              <button
                type="button"
                className="md-btn"
                style={{ textDecoration: "line-through" }}
                onClick={() => applyWrap("~~")}
              >
                S
              </button>
              <span className="md-toolbar-divider" />
              <button type="button" className="md-btn" onClick={() => applyLinePrefix("# ")}>
                H1
              </button>
              <button type="button" className="md-btn" onClick={() => applyLinePrefix("## ")}>
                H2
              </button>
              <span className="md-toolbar-divider" />
              <button type="button" className="md-btn" onClick={() => applyLinePrefix("- ")}>
                •
              </button>
              <button type="button" className="md-btn" onMouseDown={noPropagateMouseDown} onClick={openLinkInput}>
                Link
              </button>
            </>
          ) : (
            <input
              autoFocus
              className="md-toolbar-input"
              value={linkUrl}
              placeholder="https://…"
              onChange={(e) => setLinkUrl(e.target.value)}
              onBlur={handleLinkInputBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmLink();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setToolbar((t) => ({ ...t, mode: "format" }));
                  textareaRef.current?.focus();
                }
              }}
            />
          )}
        </div>
      )}

      <div className="filter-row" style={{ justifyContent: "space-between" }}>
        <button type="submit" className="btn small">
          Save
        </button>
        {savedLabel && <span className="caption">Saved {savedLabel}</span>}
      </div>
    </form>
  );
}
