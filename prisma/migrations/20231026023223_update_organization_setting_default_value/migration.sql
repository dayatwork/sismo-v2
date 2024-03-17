-- AlterTable
ALTER TABLE "OrganizationSettings" ALTER COLUMN "allowEditTracker" SET DEFAULT false,
ALTER COLUMN "timeTrackerLimited" SET DEFAULT true,
ALTER COLUMN "maxTimeTrackerInHours" SET DEFAULT 4;
