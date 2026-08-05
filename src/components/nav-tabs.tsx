"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ALL_TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/timelines", label: "Timelines" },
  { href: "/shipments", label: "Shipments" },
  { href: "/techpacks", label: "Techpacks" },
  { href: "/cases", label: "Cases" },
  { href: "/content", label: "Content" },
  { href: "/finance", label: "Finance" },
];
const DEFAULT_HREFS = ALL_TABS.map((t) => t.href);
const STORAGE_KEY = "wandern:tab-order";

let listeners: Array<() => void> = [];
function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}
function notify() {
  for (const l of listeners) l();
}
function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}
function getServerSnapshot() {
  return "";
}
function writeOrder(next: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notify();
}

function parseOrder(raw: string): string[] {
  if (!raw) return DEFAULT_HREFS;
  try {
    const parsed: string[] = JSON.parse(raw);
    const valid = parsed.filter((h) => DEFAULT_HREFS.includes(h));
    const missing = DEFAULT_HREFS.filter((h) => !valid.includes(h));
    return [...valid, ...missing];
  } catch {
    return DEFAULT_HREFS;
  }
}

export function NavTabs() {
  const pathname = usePathname();
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const order = useMemo(() => parseOrder(raw), [raw]);
  const [draggedHref, setDraggedHref] = useState<string | null>(null);
  const [dragOverHref, setDragOverHref] = useState<string | null>(null);

  function handleDrop(targetHref: string) {
    if (draggedHref && draggedHref !== targetHref) {
      const next = [...order];
      const fromIdx = next.indexOf(draggedHref);
      const toIdx = next.indexOf(targetHref);
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, draggedHref);
      writeOrder(next);
    }
    setDraggedHref(null);
    setDragOverHref(null);
  }

  const tabsByHref = new Map(ALL_TABS.map((t) => [t.href, t]));

  return (
    <nav>
      {order.map((href) => {
        const tab = tabsByHref.get(href);
        if (!tab) return null;
        const active = pathname === tab.href;
        const classes = [active ? "active" : "", dragOverHref === tab.href ? "drag-over" : ""]
          .filter(Boolean)
          .join(" ");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={classes || undefined}
            draggable
            onDragStart={() => setDraggedHref(tab.href)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverHref(tab.href);
            }}
            onDragLeave={() => setDragOverHref((h) => (h === tab.href ? null : h))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(tab.href);
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
