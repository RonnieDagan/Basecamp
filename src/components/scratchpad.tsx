import { prisma } from "@/lib/prisma";
import { saveScratchpad } from "./scratchpad-actions";

export async function Scratchpad() {
  const pad = await prisma.scratchpad.findFirst();

  return (
    <div className="card">
      <div className="section-head" style={{ marginBottom: "10px" }}>
        <h2 style={{ fontSize: "15px" }}>Scratchpad</h2>
        {pad?.updatedAt && (
          <span className="caption">
            Saved{" "}
            {pad.updatedAt.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      <form action={saveScratchpad} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <textarea
          name="content"
          rows={6}
          defaultValue={pad?.content ?? ""}
          placeholder="Quick notes, ideas, things to remember — nothing fancy, just jot it down."
        />
        <button type="submit" className="btn small" style={{ alignSelf: "flex-start" }}>
          Save
        </button>
      </form>
    </div>
  );
}
