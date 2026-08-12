"use client";

import { useRef, useState, useTransition } from "react";
import { createFolder } from "./actions";
import { CategoryPicker } from "./category-picker";

export function FolderForm({ categories }: { categories: string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <div className="section-head">
        <h2>Ideas &amp; Photo Inspo</h2>
        <button type="button" className="btn" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ new folder"}
        </button>
      </div>

      {open && (
        <form
          key={resetKey}
          ref={formRef}
          className="form-panel open"
          action={(formData: FormData) => {
            startTransition(async () => {
              await createFolder(formData);
              setResetKey((k) => k + 1);
              setOpen(false);
            });
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label>Folder name</label>
              <input name="name" required placeholder="Fall lookbook shoot" />
            </div>
            <CategoryPicker categories={categories} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea name="description" rows={2} placeholder="What this shoot/idea is about" />
          </div>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Saving…" : "Save folder"}
          </button>{" "}
          <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      )}
    </>
  );
}
