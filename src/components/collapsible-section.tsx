"use client";

import { useSyncExternalStore } from "react";

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
function getServerSnapshot() {
  return false;
}

export function CollapsibleSection({
  storageKey,
  title,
  children,
}: {
  storageKey: string;
  title: string;
  children: React.ReactNode;
}) {
  const key = `wandern:collapsed:${storageKey}`;
  const collapsed = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key) === "1",
    getServerSnapshot
  );

  function toggle() {
    localStorage.setItem(key, collapsed ? "0" : "1");
    notify();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: collapsed ? "space-between" : "flex-end", alignItems: "center" }}>
        {collapsed && <span style={{ fontSize: "13px", fontWeight: 500 }}>{title}</span>}
        <button type="button" className="btn ghost small" onClick={toggle}>
          {collapsed ? "Expand" : "Minimize"}
        </button>
      </div>
      {!collapsed && children}
    </div>
  );
}
