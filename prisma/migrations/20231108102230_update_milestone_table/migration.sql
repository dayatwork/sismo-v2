/*
  Warnings:

  - You are about to drop the column `endAt` on the `Milestone` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `Milestone` table. All the data in the column will be lost.
  - You are about to drop the column `targetEnd` on the `Milestone` table. All the data in the column will be lost.
  - You are about to drop the column `targetStart` on the `Milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "endAt",
DROP COLUMN "startAt",
DROP COLUMN "targetEnd",
DROP COLUMN "targetStart",
ADD COLUMN     "weight" SMALLINT DEFAULT 0;
