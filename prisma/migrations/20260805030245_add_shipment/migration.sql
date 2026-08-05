-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tracking" TEXT,
    "eta" TIMESTAMP(3),
    "notes" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);
