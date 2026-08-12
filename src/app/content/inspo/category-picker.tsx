"use client";

import { useEffect, useRef, useState } from "react";

export function CategoryPicker({
  categories,
  defaultValue = "",
}: {
  categories: string[];
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const trimmed = query.trim();
  const filtered = trimmed
    ? categories.filter((c) => c.toLowerCase().includes(trimmed.toLowerCase()))
    : categories;

  return (
    <div className="field combo" ref={containerRef}>
      <label>Category</label>
      <input
        name="category"
        required
        placeholder="Pick or type a category"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="combo-popup">
          {filtered.map((c) => (
            <button
              type="button"
              key={c}
              className="combo-option"
              onClick={() => {
                setQuery(c);
                setOpen(false);
              }}
            >
              <span>{c}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
