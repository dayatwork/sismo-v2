/*
  Warnings:

  - A unique constraint covering the columns `[timeTrackerId,taskId]` on the table `TrackerItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TrackerItem_timeTrackerId_taskId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "TrackerItem_timeTrackerId_taskId_key" ON "TrackerItem"("timeTrackerId", "taskId");
