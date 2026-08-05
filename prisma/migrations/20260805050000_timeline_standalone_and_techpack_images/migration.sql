-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_shipmentStageId_fkey";

-- DropForeignKey
ALTER TABLE "ShipmentStage" DROP CONSTRAINT "ShipmentStage_shipmentId_fkey";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "shipmentStageId",
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "timelineStageId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineStage" (
    "id" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechpackImage" (
    "id" TEXT NOT NULL,
    "techpackId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechpackImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimelineStage_timelineId_name_key" ON "TimelineStage"("timelineId", "name");

-- AddForeignKey
ALTER TABLE "TimelineStage" ADD CONSTRAINT "TimelineStage_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_timelineStageId_fkey" FOREIGN KEY ("timelineStageId") REFERENCES "TimelineStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechpackImage" ADD CONSTRAINT "TechpackImage_techpackId_fkey" FOREIGN KEY ("techpackId") REFERENCES "Techpack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: preserve existing shipment-linked stage progress as standalone Timelines
-- before the old ShipmentStage table (per-shipment stages) is dropped.
DO $$
DECLARE
  r RECORD;
  v_timeline_id TEXT;
BEGIN
  FOR r IN SELECT * FROM "Shipment" LOOP
    v_timeline_id := gen_random_uuid()::text;

    INSERT INTO "Timeline" (id, name, notes, flagged, "createdAt", "updatedAt")
    VALUES (v_timeline_id, r.name, r.notes, r.flagged, r."createdAt", now());

    INSERT INTO "TimelineStage" (id, "timelineId", name, "order", status, notes, "createdAt", "updatedAt")
    SELECT gen_random_uuid()::text, v_timeline_id, s.name, s."order", s.status, s.notes, s."createdAt", s."updatedAt"
    FROM "ShipmentStage" s
    WHERE s."shipmentId" = r.id;
  END LOOP;
END $$;

-- DropTable
DROP TABLE "ShipmentStage";
