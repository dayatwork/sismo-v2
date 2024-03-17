/*
  Warnings:

  - You are about to drop the column `allowClockinWIthUnplannedTasks` on the `OrganizationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `allowEditTracker` on the `OrganizationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `editableTrackerLimitInDays` on the `OrganizationSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrganizationSettings" DROP COLUMN "allowClockinWIthUnplannedTasks",
DROP COLUMN "allowEditTracker",
DROP COLUMN "editableTrackerLimitInDays",
ADD COLUMN     "allowClockinWithUnplannedTasks" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowEditTimeTracker" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeTrackerEditLimitInDays" SMALLINT;
