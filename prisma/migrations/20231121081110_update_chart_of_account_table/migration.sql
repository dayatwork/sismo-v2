/*
  Warnings:

  - You are about to drop the column `classId` on the `ChartOfAccount` table. All the data in the column will be lost.
  - Added the required column `classId` to the `ChartOfAccountType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChartOfAccount" DROP CONSTRAINT "ChartOfAccount_classId_fkey";

-- AlterTable
ALTER TABLE "ChartOfAccount" DROP COLUMN "classId";

-- AlterTable
ALTER TABLE "ChartOfAccountType" ADD COLUMN     "classId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ChartOfAccountType" ADD CONSTRAINT "ChartOfAccountType_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ChartOfAccountClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
