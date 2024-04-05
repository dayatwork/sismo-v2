-- AlterTable
ALTER TABLE "TaskTracker" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;
