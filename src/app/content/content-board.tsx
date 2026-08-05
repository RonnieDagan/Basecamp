"use client";

import { useMemo, useState } from "react";
import type { Post } from "@prisma/client";
import { platformLabels, typeLabels, statusLabels, platformColors } from "@/lib/content-labels";
import { deletePost, updatePost } from "./actions";
import { Linkify } from "@/components/linkify";
import { PostImageUpload } from "./post-image-upload";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function dateToIsoUTC(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}
function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

type Cell = { label: number; iso?: string; muted?: boolean };

function buildCells(year: number, month: number): Cell[] {
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < startDow; i++) cells.push({ label: daysInPrev - startDow + 1 + i, muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ label: d, iso: toIso(year, month, d) });
  const remain = (7 - ((startDow + daysInMonth) % 7)) % 7;
  for (let i = 1; i <= remain; i++) cells.push({ label: i, muted: true });
  return cells;
}

export function ContentBoard({ posts }: { posts: Post[] }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());
  const cells = useMemo(() => buildCells(viewYear, viewMonth), [viewYear, viewMonth]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const p of posts) {
      const iso = dateToIsoUTC(p.date);
      const list = map.get(iso) ?? [];
      list.push(p);
      map.set(iso, list);
    }
    return map;
  }, [posts]);

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

  let items = posts;
  if (platformFilter !== "all") items = items.filter((p) => p.platform === platformFilter);
  if (statusFilter !== "all") items = items.filter((p) => p.status === statusFilter);
  if (dayFilter) items = items.filter((p) => dateToIsoUTC(p.date) === dayFilter);
  items = [...items].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <>
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="cal-head">
          <button type="button" className="btn ghost small" onClick={() => navMonth(-1)}>
            ‹
          </button>
          <span className="mono">
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
            const dayPosts = postsByDay.get(cell.iso) ?? [];
            const classes = ["cal-day"];
            if (cell.iso === todayIso) classes.push("today");
            if (cell.iso === dayFilter) classes.push("selected");
            return (
              <div
                key={i}
                className={classes.join(" ")}
                onClick={() => setDayFilter((d) => (d === cell.iso ? null : cell.iso!))}
              >
                {cell.label}
                {dayPosts.length > 0 && (
                  <div className="pips">
                    {dayPosts.slice(0, 3).map((p) => (
                      <span key={p.id} className="pip" style={{ background: platformColors[p.platform] }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {dayFilter && (
          <div className="caption">
            Showing posts for one day —{" "}
            <span
              style={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={() => setDayFilter(null)}
            >
              clear filter
            </span>
          </div>
        )}
      </div>

      <div className="filter-row">
        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
          <option value="all">All platforms</option>
          {Object.entries(platformLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="empty">No posts match this view.</div>
      ) : (
        items.map((p) => (
          <details className="row-details" key={p.id}>
            <summary>
              <span className="dot" style={{ background: platformColors[p.platform] }} />
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt=""
                  style={{ width: "28px", height: "28px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 }}
                />
              )}
              <span className="tag tag-dim" style={{ width: "80px", textAlign: "center" }}>
                {platformLabels[p.platform]}
              </span>
              <span style={{ flex: 1, fontSize: "14px" }}>
                {typeLabels[p.type]}
                {p.product ? ` · ${p.product}` : ""}
                {p.notes ? ` — ${p.notes}` : ""}
              </span>
              <span
                className="mono"
                style={{ fontSize: "12px", color: "var(--text-dim)", width: "56px", textAlign: "right" }}
              >
                {formatDate(p.date)}
              </span>
              <span
                className={`tag ${p.status === "Posted" ? "tag-moss" : "tag-dim"}`}
                style={{ width: "90px", textAlign: "center" }}
              >
                {statusLabels[p.status]}
              </span>
            </summary>

            <div className="row-expanded">
              <div className="field">
                <label>Image</label>
                <PostImageUpload postId={p.id} imageUrl={p.imageUrl} imageFilename={p.imageFilename} />
              </div>
              <form action={updatePost}>
                <input type="hidden" name="id" value={p.id} />
                <div className="form-grid">
                  <div className="field">
                    <label>Status</label>
                    <select name="status" defaultValue={p.status}>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Linked product</label>
                    <input name="product" defaultValue={p.product ?? ""} />
                  </div>
                  <div className="field">
                    <label>UGC partner</label>
                    <input name="partner" defaultValue={p.partner ?? ""} />
                  </div>
                </div>
                <div className="field">
                  <label>Idea / caption</label>
                  <Linkify text={p.notes} />
                  <textarea name="notes" rows={4} defaultValue={p.notes ?? ""} />
                </div>
                <button type="submit" className="btn small">
                  Save
                </button>
              </form>
              <form action={deletePost} style={{ marginTop: "8px" }}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="btn ghost small">
                  Delete
                </button>
              </form>
            </div>
          </details>
        ))
      )}
    </>
  );
}
