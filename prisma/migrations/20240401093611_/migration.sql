/*
  Warnings:

  - You are about to drop the `AttachmentV2` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AttachmentV2" DROP CONSTRAINT "AttachmentV2_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "AttachmentV2" DROP CONSTRAINT "AttachmentV2_taskId_fkey";

-- DropForeignKey
ALTER TABLE "AttachmentV2" DROP CONSTRAINT "AttachmentV2_trackerItemId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_parentId_fkey";

-- DropTable
DROP TABLE "AttachmentV2";

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Service";

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "trackerItemId" TEXT,
    "taskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attachment_trackerItemId_idx" ON "Attachment"("trackerItemId");

-- CreateIndex
CREATE INDEX "Attachment_taskId_idx" ON "Attachment"("taskId");

-- CreateIndex
CREATE INDEX "Attachment_ownerId_idx" ON "Attachment"("ownerId");

-- CreateIndex
CREATE INDEX "Attachment_displayName_idx" ON "Attachment"("displayName");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_trackerItemId_fkey" FOREIGN KEY ("trackerItemId") REFERENCES "TaskTrackerItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "BoardTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
