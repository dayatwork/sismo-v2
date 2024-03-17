-- DropForeignKey
ALTER TABLE "TrackerItem" DROP CONSTRAINT "TrackerItem_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TrackerItem" DROP CONSTRAINT "TrackerItem_timeTrackerId_fkey";

-- AddForeignKey
ALTER TABLE "TrackerItem" ADD CONSTRAINT "TrackerItem_timeTrackerId_fkey" FOREIGN KEY ("timeTrackerId") REFERENCES "TimeTracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackerItem" ADD CONSTRAINT "TrackerItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
