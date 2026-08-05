"use client";

import { useEffect, useRef, useState } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplay(iso: string) {
  const dt = new Date(iso + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Cell = { label: number; iso?: string; muted?: boolean };

function buildCells(year: number, month: number): Cell[] {
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: Cell[] = [];
  for (let i = 0; i < startDow; i++) {
    cells.push({ label: daysInPrev - startDow + 1 + i, muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ label: d, iso: toIso(year, month, d) });
  }
  const remain = (7 - ((startDow + daysInMonth) % 7)) % 7;
  for (let i = 1; i <= remain; i++) {
    cells.push({ label: i, muted: true });
  }
  return cells;
}

export function DatePicker({
  name,
  defaultValue,
  placeholder = "Pick date",
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [selected, setSelected] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const base = selected ? new Date(selected + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());
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

  function openPopup() {
    const anchor = selected ? new Date(selected + "T00:00:00") : new Date();
    setViewYear(anchor.getFullYear());
    setViewMonth(anchor.getMonth());
    setOpen((o) => !o);
  }

  function navMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  const now = new Date();
  const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());
  const cells = buildCells(viewYear, viewMonth);

  return (
    <div className="datefield" ref={containerRef}>
      <input type="hidden" name={name} value={selected} />
      <button type="button" className="date-btn" onClick={openPopup}>
        {selected ? formatDisplay(selected) : placeholder}
      </button>

      {open && (
        <div className="cal-popup">
          <div className="cal-head">
            <button type="button" className="btn ghost small" onClick={() => navMonth(-1)}>
              ‹
            </button>
            <span>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" className="btn ghost small" onClick={() => navMonth(1)}>
              ›
            </button>
          </div>

          <div className="cal-grid">
            {DOW_LABELS.map((d, i) => (
              <div key={i} className="cal-dow">
                {d}
              </div>
            ))}
            {cells.map((cell, i) => {
              if (cell.muted || !cell.iso) {
                return (
                  <div key={i} className="cal-day other">
                    {cell.label}
                  </div>
                );
              }
              const classes = ["cal-day"];
              if (cell.iso === todayIso) classes.push("today");
              if (cell.iso === selected) classes.push("selected");
              return (
                <button
                  type="button"
                  key={i}
                  className={classes.join(" ")}
                  onClick={() => {
                    setSelected(cell.iso!);
                    setOpen(false);
                  }}
                >
                  {cell.label}
                </button>
              );
            })}
          </div>

          <div style={{ textAlign: "right", marginTop: "8px" }}>
            <button
              type="button"
              className="btn ghost small"
              onClick={() => {
                setSelected("");
                setOpen(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
