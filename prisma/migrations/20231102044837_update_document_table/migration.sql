/*
  Warnings:

  - You are about to drop the column `name` on the `Document` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Document_name_organizationId_idx";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "name",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled',
ADD COLUMN     "whiteList" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Document_title_organizationId_idx" ON "Document"("title", "organizationId");
