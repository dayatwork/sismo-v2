/*
  Warnings:

  - You are about to drop the column `deliverable` on the `Stage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stage" DROP COLUMN "deliverable",
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '';
