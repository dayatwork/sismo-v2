-- CreateTable
CREATE TABLE "OrganizationSetting" (
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

    CONSTRAINT "OrganizationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSetting_organizationId_key" ON "OrganizationSetting"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationSetting" ADD CONSTRAINT "OrganizationSetting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
