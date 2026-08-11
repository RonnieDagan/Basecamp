"use client";

import { useRef, useState, useTransition } from "react";
import {
  updateStageStatus,
  updateStageNotes,
  uploadAttachment,
  deleteAttachment,
  updateTimelineNotes,
  updateTimelineFlag,
  deleteTimeline,
} from "./actions";
import type { Timeline as TimelineRow, TimelineStage, Attachment } from "@prisma/client";
import { Linkify } from "@/components/linkify";
import { truncateFilename } from "@/lib/format";

type StageWithAttachments = TimelineStage & { attachments: Attachment[] };
type TimelineWithStages = TimelineRow & { stages: StageWithAttachments[] };

function pickDefaultStage(stages: StageWithAttachments[]) {
  const current = stages.find((s) => s.status === "Current");
  if (current) return current.name;
  const pending = stages.find((s) => s.status === "Pending");
  if (pending) return pending.name;
  return stages[stages.length - 1]?.name ?? "";
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Timeline({ timeline }: { timeline: TimelineWithStages }) {
  const sortedStages = [...timeline.stages].sort((a, b) => a.order - b.order);
  const [selected, setSelected] = useState(() => pickDefaultStage(sortedStages));
  const [detailsOpen, setDetailsOpen] = useState(false);
  const statusFormRef = useRef<HTMLFormElement>(null);
  const notesFormRef = useRef<HTMLFormElement>(null);
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const timelineNotesRef = useRef<HTMLFormElement>(null);
  const [uploading, startUploadTransition] = useTransition();

  const stage = sortedStages.find((s) => s.name === selected) ?? sortedStages[0];

  return (
    <div className="card">
      <div className="section-head" style={{ marginBottom: 0 }}>
        <div className="row-title-wrap">
          <div className="row-title" style={{ fontWeight: 500, fontSize: "15px" }}>
            {timeline.name}
          </div>
          {timeline.notes && !detailsOpen && (
            <span className="row-preview" style={{ maxWidth: "none" }}>
              {timeline.notes.length > 80 ? `${timeline.notes.slice(0, 80)}…` : timeline.notes}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className={`tag ${timeline.flagged ? "tag-clay" : "tag-moss"}`}>
            {timeline.flagged ? "Flagged" : "On track"}
          </span>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => setDetailsOpen((o) => !o)}
          >
            {detailsOpen ? "Less" : "More"}
          </button>
        </div>
      </div>

      <div className="trail">
        <div className="line" />
        <div className="stages">
          {sortedStages.map((s) => {
            let ptClass = "pt";
            if (s.status === "Done") ptClass += " done";
            if (s.status === "Current") ptClass += " now " + (timeline.flagged ? "flag" : "ok");
            const isSelected = s.name === selected;
            const stageClass =
              "stage" +
              (s.status === "Current" ? " current" : "") +
              (isSelected ? " selected" : "") +
              " clickable";
            return (
              <div key={s.id} className={stageClass} onClick={() => setSelected(s.name)}>
                <div className={ptClass} />
                <span>{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {detailsOpen && (
        <div className="stage-panel" style={{ marginBottom: "10px" }}>
          <div className="section-head" style={{ marginBottom: "10px" }}>
            <h3 style={{ fontSize: "14px" }}>Timeline details</h3>
            <form action={updateTimelineFlag}>
              <input type="hidden" name="id" value={timeline.id} />
              <input
                type="hidden"
                name="flagged"
                value={timeline.flagged ? "" : "on"}
              />
              <button type="submit" className="btn ghost small">
                {timeline.flagged ? "Clear flag" : "Flag for attention"}
              </button>
            </form>
          </div>
          <div className="field">
            <label>Notes</label>
            <Linkify text={timeline.notes} />
            <form key={timeline.id} ref={timelineNotesRef} action={updateTimelineNotes}>
              <input type="hidden" name="id" value={timeline.id} />
              <textarea
                name="notes"
                rows={4}
                defaultValue={timeline.notes ?? ""}
                placeholder="What this run/goal is about"
                onBlur={() => timelineNotesRef.current?.requestSubmit()}
              />
            </form>
          </div>
          <form action={deleteTimeline}>
            <input type="hidden" name="id" value={timeline.id} />
            <button type="submit" className="btn ghost small">
              Delete timeline
            </button>
          </form>
        </div>
      )}

      {stage && (
        <div className="stage-panel">
          <div className="section-head" style={{ marginBottom: "10px" }}>
            <h3 style={{ fontSize: "14px" }}>{stage.name}</h3>
            <form key={stage.id} ref={statusFormRef} action={updateStageStatus}>
              <input type="hidden" name="stageId" value={stage.id} />
              <select
                name="status"
                defaultValue={stage.status}
                style={{ width: "130px" }}
                onChange={() => statusFormRef.current?.requestSubmit()}
              >
                <option value="Pending">Pending</option>
                <option value="Current">Current</option>
                <option value="Done">Done</option>
              </select>
            </form>
          </div>

          <div className="field">
            <label>Notes for this stage</label>
            <Linkify text={stage.notes} />
            <form key={stage.id + "-notes"} ref={notesFormRef} action={updateStageNotes}>
              <input type="hidden" name="stageId" value={stage.id} />
              <textarea
                name="notes"
                rows={4}
                defaultValue={stage.notes ?? ""}
                placeholder="What happened, who to follow up with, dates"
                onBlur={() => notesFormRef.current?.requestSubmit()}
              />
            </form>
          </div>

          <div className="field">
            <label>Attachments</label>
            <form
              key={stage.id + "-upload"}
              ref={uploadFormRef}
              action={(formData: FormData) => {
                startUploadTransition(async () => {
                  await uploadAttachment(formData);
                  uploadFormRef.current?.reset();
                });
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input type="hidden" name="stageId" value={stage.id} />
              <input type="file" name="file" multiple required />
              <button type="submit" className="btn small" disabled={uploading}>
                {uploading ? "Uploading…" : "Add"}
              </button>
            </form>
            <div className="caption">
              Files are stored (up to ~50MB each) — Photoshop/Illustrator files show a file icon
              rather than a rendered preview, since browsers can&apos;t render .psd/.ai natively.
            </div>
            <div style={{ marginTop: "6px" }}>
              {stage.attachments.length === 0 ? (
                <span className="caption">No attachments logged.</span>
              ) : (
                stage.attachments.map((a) => {
                  const isImage = a.mimeType?.startsWith("image/");
                  return (
                    <span className="file-chip" key={a.id}>
                      <a
                        href={a.blobUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "inherit", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.blobUrl}
                            alt={a.filename}
                            style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                          />
                        ) : (
                          <span aria-hidden style={{ fontSize: "18px" }}>📄</span>
                        )}
                        {truncateFilename(a.filename)}
                        {a.size ? ` (${formatFileSize(a.size)})` : ""}
                      </a>
                      <form action={deleteAttachment} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="icon-del" style={{ padding: "0 2px" }}>
                          ✕
                        </button>
                      </form>
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
