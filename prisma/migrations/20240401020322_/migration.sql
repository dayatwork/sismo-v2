/*
  Warnings:

  - Made the column `taskId` on table `TaskTrackerItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TaskTrackerItem" DROP CONSTRAINT "TaskTrackerItem_taskId_fkey";

-- AlterTable
ALTER TABLE "TaskTrackerItem" ALTER COLUMN "taskId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "TaskTrackerItem" ADD CONSTRAINT "TaskTrackerItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "BoardTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
