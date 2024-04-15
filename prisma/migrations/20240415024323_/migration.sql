-- DropForeignKey
ALTER TABLE "TaskTrackerItem" DROP CONSTRAINT "TaskTrackerItem_trackerId_fkey";

-- AddForeignKey
ALTER TABLE "TaskTrackerItem" ADD CONSTRAINT "TaskTrackerItem_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "TaskTracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
