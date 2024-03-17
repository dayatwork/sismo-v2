/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_serviceId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "serviceId";

-- CreateTable
CREATE TABLE "_ProjectToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToService_AB_unique" ON "_ProjectToService"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToService_B_index" ON "_ProjectToService"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProject_AB_unique" ON "_ProductToProject"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToProject_B_index" ON "_ProductToProject"("B");

-- AddForeignKey
ALTER TABLE "_ProjectToService" ADD CONSTRAINT "_ProjectToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToService" ADD CONSTRAINT "_ProjectToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProject" ADD CONSTRAINT "_ProductToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProject" ADD CONSTRAINT "_ProductToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
