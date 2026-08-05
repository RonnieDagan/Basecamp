-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('Pending', 'Current', 'Done');

-- CreateEnum
CREATE TYPE "TechpackCategory" AS ENUM ('Pants', 'Beanie', 'Thermal', 'Midlayer', 'Hat', 'Other');

-- CreateEnum
CREATE TYPE "TechpackStatus" AS ENUM ('Draft', 'Active', 'UnderRevision', 'Discontinued');

-- CreateEnum
CREATE TYPE "CaseIssue" AS ENUM ('DelayedShipment', 'ProductDefect', 'RefundRequest', 'Other');

-- CreateEnum
CREATE TYPE "CaseResolution" AS ENUM ('Pending', 'FreeItem', 'DiscountCode', 'Refund', 'Replacement');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('Open', 'Resolved', 'Escalated');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('Instagram', 'TikTok', 'Both');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('Reel', 'StaticPost', 'Story', 'UGCRepost');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('Idea', 'Scripted', 'Filmed', 'Edited', 'Scheduled', 'Posted');

-- CreateEnum
CREATE TYPE "FinanceType" AS ENUM ('CreditCard', 'TaxFiling', 'ChargebackRefund', 'Other');

-- CreateTable
CREATE TABLE "ShipmentStage" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "shipmentStageId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Techpack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TechpackCategory" NOT NULL,
    "version" TEXT NOT NULL,
    "status" "TechpackStatus" NOT NULL DEFAULT 'Draft',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Techpack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "issue" "CaseIssue" NOT NULL,
    "resolution" "CaseResolution" NOT NULL DEFAULT 'Pending',
    "status" "CaseStatus" NOT NULL DEFAULT 'Open',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "type" "PostType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'Idea',
    "product" TEXT,
    "partner" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceItem" (
    "id" TEXT NOT NULL,
    "type" "FinanceType" NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "amount" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentStage_shipmentId_name_key" ON "ShipmentStage"("shipmentId", "name");

-- AddForeignKey
ALTER TABLE "ShipmentStage" ADD CONSTRAINT "ShipmentStage_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_shipmentStageId_fkey" FOREIGN KEY ("shipmentStageId") REFERENCES "ShipmentStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
