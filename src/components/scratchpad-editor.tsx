"use client";

import { useRef, useState } from "react";
import { saveScratchpad } from "./scratchpad-actions";

type ToolbarState = { visible: boolean; top: number; left: number; mode: "format" | "link" };
type ActiveStates = { bold: boolean; italic: boolean; strike: boolean; h2: boolean; h3: boolean; ul: boolean };

const NO_ACTIVE: ActiveStates = { bold: false, italic: false, strike: false, h2: false, h3: false, ul: false };

const noPropagateMouseDown = (e: React.MouseEvent) => e.preventDefault();

export function ScratchpadEditor({
  initialContent,
  savedLabel,
}: {
  initialContent: string;
  savedLabel: string | null;
}) {
  const editableRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [toolbar, setToolbar] = useState<ToolbarState>({ visible: false, top: 0, left: 0, mode: "format" });
  const [linkUrl, setLinkUrl] = useState("");
  const [active, setActive] = useState<ActiveStates>(NO_ACTIVE);

  function updateToolbarFromSelection() {
    const editable = editableRef.current;
    const sel = window.getSelection();
    if (!editable || !sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setToolbar((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    const range = sel.getRangeAt(0);
    if (!editable.contains(range.commonAncestorContainer)) {
      setToolbar((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const formatBlock = document.queryCommandValue("formatBlock").toLowerCase();
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      strike: document.queryCommandState("strikeThrough"),
      h2: formatBlock === "h2",
      h3: formatBlock === "h3",
      ul: document.queryCommandState("insertUnorderedList"),
    });
    setToolbar({ visible: true, top: rect.top, left: rect.left + rect.width / 2, mode: "format" });
  }

  function exec(command: string, value?: string) {
    editableRef.current?.focus();
    document.execCommand(command, false, value);
    updateToolbarFromSelection();
  }

  function toggleHeading(tag: "H2" | "H3") {
    const current = document.queryCommandValue("formatBlock").toLowerCase();
    exec("formatBlock", current === tag.toLowerCase() ? "P" : tag);
  }

  function openLinkInput() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
    setLinkUrl("");
    setToolbar((t) => ({ ...t, mode: "link" }));
  }

  function confirmLink() {
    const url = linkUrl.trim();
    const editable = editableRef.current;
    if (url && editable && savedRange.current) {
      editable.focus();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange.current);
      document.execCommand("createLink", false, url);
    }
    setToolbar((t) => ({ ...t, visible: false, mode: "format" }));
  }

  function handleEditableBlur(e: React.FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null;
    if (next && toolbarRef.current?.contains(next)) return;
    setToolbar((t) => ({ ...t, visible: false }));
  }

  function handleLinkInputBlur(e: React.FocusEvent<HTMLInputElement>) {
    const next = e.relatedTarget as Node | null;
    if (next && toolbarRef.current?.contains(next)) return;
    setToolbar((t) => ({ ...t, visible: false }));
  }

  function handleSubmit() {
    if (hiddenInputRef.current && editableRef.current) {
      hiddenInputRef.current.value = editableRef.current.innerHTML;
    }
  }

  return (
    <form
      action={saveScratchpad}
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
    >
      <input ref={hiddenInputRef} type="hidden" name="content" defaultValue={initialContent} />
      <div
        ref={editableRef}
        className="scratchpad-editable"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Quick notes, ideas, things to remember — highlight text to format it."
        dangerouslySetInnerHTML={{ __html: initialContent }}
        onMouseUp={updateToolbarFromSelection}
        onKeyUp={updateToolbarFromSelection}
        onBlur={handleEditableBlur}
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
              <button
                type="button"
                className={`md-btn${active.bold ? " active" : ""}`}
                style={{ fontWeight: 700 }}
                onClick={() => exec("bold")}
              >
                B
              </button>
              <button
                type="button"
                className={`md-btn${active.italic ? " active" : ""}`}
                style={{ fontStyle: "italic" }}
                onClick={() => exec("italic")}
              >
                I
              </button>
              <button
                type="button"
                className={`md-btn${active.strike ? " active" : ""}`}
                style={{ textDecoration: "line-through" }}
                onClick={() => exec("strikeThrough")}
              >
                S
              </button>
              <span className="md-toolbar-divider" />
              <button
                type="button"
                className={`md-btn${active.h2 ? " active" : ""}`}
                onClick={() => toggleHeading("H2")}
              >
                H1
              </button>
              <button
                type="button"
                className={`md-btn${active.h3 ? " active" : ""}`}
                onClick={() => toggleHeading("H3")}
              >
                H2
              </button>
              <span className="md-toolbar-divider" />
              <button
                type="button"
                className={`md-btn${active.ul ? " active" : ""}`}
                onClick={() => exec("insertUnorderedList")}
              >
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
                  editableRef.current?.focus();
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
