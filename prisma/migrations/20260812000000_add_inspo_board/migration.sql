-- CreateEnum
CREATE TYPE "InspoItemType" AS ENUM ('Image', 'Video', 'Link');

-- CreateTable
CREATE TABLE "InspoFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InspoFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspoItem" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "type" "InspoItemType" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "filename" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InspoItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InspoItem" ADD CONSTRAINT "InspoItem_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "InspoFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
