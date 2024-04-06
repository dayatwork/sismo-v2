/*
  Warnings:

  - You are about to drop the column `classId` on the `ChartOfAccountType` table. All the data in the column will be lost.
  - You are about to drop the `ChartOfAccountClass` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `categoryId` on table `ChartOfAccountType` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ChartOfAccountType" DROP CONSTRAINT "ChartOfAccountType_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ChartOfAccountType" DROP CONSTRAINT "ChartOfAccountType_classId_fkey";

-- AlterTable
ALTER TABLE "ChartOfAccountType" DROP COLUMN "classId",
ALTER COLUMN "categoryId" SET NOT NULL;

-- DropTable
DROP TABLE "ChartOfAccountClass";

-- AddForeignKey
ALTER TABLE "ChartOfAccountType" ADD CONSTRAINT "ChartOfAccountType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ChartOfAccountCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
