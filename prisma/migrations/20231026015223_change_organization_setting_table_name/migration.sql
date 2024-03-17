/*
  Warnings:

  - You are about to drop the `OrganizationSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrganizationSetting" DROP CONSTRAINT "OrganizationSetting_organizationId_fkey";

-- DropTable
DROP TABLE "OrganizationSetting";

-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "allowEditTracker" BOOLEAN NOT NULL DEFAULT true,
    "editableTrackerLimitInDays" SMALLINT,
    "timeTrackerLimited" BOOLEAN NOT NULL DEFAULT false,
    "maxTimeTrackerInHours" SMALLINT,
    "allowClockinWithNewTask" BOOLEAN NOT NULL DEFAULT true,
    "allowClockinWIthUnplannedTasks" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSettings_organizationId_key" ON "OrganizationSettings"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationSettings" ADD CONSTRAINT "OrganizationSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
