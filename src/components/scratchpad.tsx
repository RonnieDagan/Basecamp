import { prisma } from "@/lib/prisma";
import { ScratchpadEditor } from "./scratchpad-editor";

export async function Scratchpad() {
  const pad = await prisma.scratchpad.findFirst();

  const savedLabel = pad?.updatedAt
    ? pad.updatedAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="card">
      <div className="section-head" style={{ marginBottom: "10px" }}>
        <h2 style={{ fontSize: "15px" }}>Scratchpad</h2>
      </div>
      <ScratchpadEditor initialContent={pad?.content ?? ""} savedLabel={savedLabel} />
    </div>
  );
}
