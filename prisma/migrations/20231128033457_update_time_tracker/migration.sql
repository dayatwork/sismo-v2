/*
  Warnings:

  - You are about to drop the column `timeTrackerId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `TimeTracker` table. All the data in the column will be lost.
  - You are about to drop the column `taskCompletion` on the `TimeTracker` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `TimeTracker` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_timeTrackerId_fkey";

-- DropForeignKey
ALTER TABLE "TimeTracker" DROP CONSTRAINT "TimeTracker_taskId_fkey";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "timeTrackerId",
ADD COLUMN     "trackerItemId" TEXT;

-- AlterTable
ALTER TABLE "TimeTracker" DROP COLUMN "note",
DROP COLUMN "taskCompletion",
DROP COLUMN "taskId";

-- CreateTable
CREATE TABLE "TrackerItem" (
    "id" TEXT NOT NULL,
    "timeTrackerId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "taskCompletion" SMALLINT NOT NULL,
    "workDurationInMinutes" SMALLINT NOT NULL,
    "note" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackerItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrackerItem" ADD CONSTRAINT "TrackerItem_timeTrackerId_fkey" FOREIGN KEY ("timeTrackerId") REFERENCES "TimeTracker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackerItem" ADD CONSTRAINT "TrackerItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_trackerItemId_fkey" FOREIGN KEY ("trackerItemId") REFERENCES "TrackerItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
