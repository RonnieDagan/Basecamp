"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ContentSubNav() {
  const pathname = usePathname();
  const tabs = [
    { href: "/content", label: "Calendar" },
    { href: "/content/inspo", label: "Ideas & Photo Inspo" },
  ];

  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="btn small"
          style={{
            textDecoration: "none",
            display: "inline-block",
            ...(pathname === tab.href
              ? {}
              : { background: "transparent", border: "1px solid var(--line-strong)", color: "var(--paper)" }),
          }}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
