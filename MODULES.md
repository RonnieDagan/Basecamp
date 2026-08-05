# Remaining modules — build instructions

This picks up where the README's tech-stack section leaves off. Only `Tasks` exists in the app right now. The sections below cover every other module, in the priority order from the PRD: **Shipments + Timelines → Techpacks → Cases → Content Calendar → Finance**. (Contacts was cut — don't build it.)

**UI reference:** `basecamp.html` (the single-file prototype) is the source of truth for layout, interactions, and visual design for every module below. It's a working, click-through mockup — open it in a browser and use it directly as the spec. Match its dark forest palette (`#1C2620` background, `#243329` cards, `#7FA084` moss / `#D89A6E` clay / `#E6C784` amber accents), Space Grotesk for headers, IBM Plex Mono for dates and data, Inter for body text. Where this doc says "see basecamp.html," it means: open that file, find the matching section, and rebuild that exact behavior with real data instead of `window.storage`.

---

## Shipments + Timelines

These are two views over one underlying entity — a shipment has a lightweight log view (`Shipments` tab) and a detailed per-stage tracker (`Timelines` tab).

**Schema:**
- `Shipment`: `name`, `tracking` (string, optional — last-leg carrier tracking only, manufacturers don't provide earlier tracking), `eta` (date), `notes` (text — freight method, manufacturer, incoterm all go here as free text, not structured fields), `flagged` (bool, manual toggle, not auto-derived from stage)
- `ShipmentStage`: belongs to `Shipment`, one row per stage (`Sourcing`, `Production`, `Booked`, `In transit`, `Customs`, `Delivered`), `status` (`pending` | `current` | `done`), `notes` (text)
- `Attachment`: belongs to `ShipmentStage`, `filename`, `blobUrl` (real upload via Vercel Blob now that it's wired up — the prototype only stored filenames as text placeholders, this version should do actual uploads)

**UI — Shipments tab (see basecamp.html "Shipments" section):**
Simple list. Add form has only 4 fields: name, tracking number, ETA (via the custom date picker — see Shared UI Patterns below), notes, and a flag checkbox. Deliberately does *not* ask for stage or freight method as structured inputs — those live in Timelines and notes respectively.

**UI — Timelines tab (see basecamp.html "Timelines" section):**
This is the signature interaction. Each shipment renders as a horizontal trail: a thin line connecting 6 waypoints (one per stage), with the dot styled by status — gray/hollow for pending, filled moss for done, larger ring for current (ring turns clay/rust if `flagged` is true). Clicking a waypoint selects it and opens a panel below the trail showing that stage's status dropdown, a notes textarea, and an attachments section (file upload button + list of uploaded files with remove buttons). Only one stage panel is open per shipment at a time; default to whichever stage has `status: current`.

---

## Techpacks

**Schema:** `name`, `category` (enum: Pants/Beanie/Thermal/Midlayer/Hat/Other), `version` (string), `status` (Draft/Active/Under revision/Discontinued), `notes` (materials, print method, sizing — free text for now)

**UI (see basecamp.html "Techpacks" section):** Grid of cards, 3 per row. Each card shows product name, category + version as a subline, a status pill (clay for "Under revision," moss for "Active," dim gray otherwise), and notes below. Simple add form, no per-field structure beyond what's listed above — keep this module lightweight.

---

## Cases

**Schema:** `customer` (string — name or a description of the batch, e.g. "Instagram DM batch — Switch-Back delay"), `issue` (Delayed shipment/Product defect/Refund request/Other), `resolution` (Pending/Free item/Discount code/Refund/Replacement), `status` (Open/Resolved/Escalated), `notes`

**UI (see basecamp.html "Cases" section):** Simple row list — status pill, customer name, issue type, resolution, delete button. No calendar or file needs here.

---

## Content Calendar

This one has the most "bells and whistles" in the prototype — worth spending real time matching it.

**Schema:** `platform` (Instagram/TikTok/Both), `type` (Reel/Static post/Story/UGC repost), `date`, `status` (Idea/Scripted/Filmed/Edited/Scheduled/Posted), `product` (string, optional — linked product name), `partner` (string, optional — UGC creator handle), `notes` (idea/caption text)

**UI (see basecamp.html "Content calendar" section) — build all of this:**
1. **Stat row** — three cards: posts this month (count of `status: Posted` in the current calendar month), current streak (consecutive days ending today with at least one Posted item), idea backlog (count of Idea + Scripted).
2. **Month calendar widget** — a real month grid (not just a date picker) with prev/next nav. Each day cell shows the day number plus small colored dots for any posts that day (dot color keyed by platform: Instagram/TikTok/Both each get a distinct color). Clicking a day filters the list below to just that day; clicking the same day again clears the filter.
3. **Filter row** below the calendar — dropdown filters for platform and status, independent of the day-click filter (all three combine).
4. **List** — same row style as other modules, with a colored dot per platform, type + linked product + notes inline, date, status pill, delete.

This is the one module where the streak/backlog numbers should be computed server-side from the `Post` table rather than stored as their own fields.

---

## Finance

**Schema:** `type` (Credit card/Tax filing/Chargeback or refund/Other), `name`, `date` (due/key date), `amount` (nullable number), `notes`

**UI (see basecamp.html "Finance" section):** Row list sorted by date ascending, soonest first. Overdue dates render in the clay/rust accent color. Amount shows only if present. Same add-form pattern as other modules.

---

## Shared UI patterns to carry through every module

- **Custom date picker** — every date field in basecamp.html uses a themed month-grid popup (not the native browser date input): click a button showing the formatted date, popup opens below it with prev/next month nav and a clickable day grid, selected day highlighted in moss, today outlined. Build this once as a shared component and reuse it for shipment ETA, task due dates, content post dates, and finance due dates.
- **Domain tags (Tasks module, already built)** — if not already matching: domains are user-creatable, not a fixed enum. Selecting "+ New domain" in the dropdown reveals a name input; on save, the domain is assigned the next color in a fixed 10-color rotation and persists for reuse. Every domain tag/dot uses that stored color, not a hardcoded class.
- **Draggable tab order** — the top nav in basecamp.html is drag-to-reorder, and whichever tab ends up leftmost becomes the default tab on next load. If the real app's nav doesn't have this yet, it's a nice-to-have worth carrying over, not a blocker.
- **Empty states** — every list has a plain centered "No [items] yet" message in dim gray when empty, rather than a blank section.

---

## Suggested build order for this pass

1. Shipments schema + simple log UI
2. ShipmentStage + Attachment schema, wired to real Vercel Blob uploads
3. Timelines UI (the trail + stage panel interaction)
4. Techpacks (lowest complexity, good warm-up before Content Calendar)
5. Cases
6. Content Calendar (save the calendar widget for when the date-picker component already exists from Shipments/Tasks — reuse the same underlying month-grid logic)
7. Finance