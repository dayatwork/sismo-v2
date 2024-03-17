/*
  Warnings:

  - You are about to drop the `_ProductToProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProjectToService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToProject" DROP CONSTRAINT "_ProductToProject_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToProject" DROP CONSTRAINT "_ProductToProject_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToService" DROP CONSTRAINT "_ProjectToService_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToService" DROP CONSTRAINT "_ProjectToService_B_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "productId" TEXT,
ADD COLUMN     "serviceId" TEXT;

-- DropTable
DROP TABLE "_ProductToProject";

-- DropTable
DROP TABLE "_ProjectToService";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
