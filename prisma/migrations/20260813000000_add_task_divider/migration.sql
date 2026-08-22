-- CreateTable
CREATE TABLE "TaskDivider" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskDivider_pkey" PRIMARY KEY ("id")
);
