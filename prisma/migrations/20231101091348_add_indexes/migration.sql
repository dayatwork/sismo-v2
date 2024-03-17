/*
  Warnings:

  - A unique constraint covering the columns `[name,organizationId]` on the table `JobLevel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Attachment_id_organizationId_idx" ON "Attachment"("id", "organizationId");

-- CreateIndex
CREATE INDEX "Client_id_organizationId_idx" ON "Client"("id", "organizationId");

-- CreateIndex
CREATE INDEX "Directorate_id_organizationId_idx" ON "Directorate"("id", "organizationId");

-- CreateIndex
CREATE INDEX "Division_id_organizationId_idx" ON "Division"("id", "organizationId");

-- CreateIndex
CREATE INDEX "EmployeePosition_id_organizationId_idx" ON "EmployeePosition"("id", "organizationId");

-- CreateIndex
CREATE INDEX "JobLevel_id_organizationId_idx" ON "JobLevel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "JobLevel_name_organizationId_key" ON "JobLevel"("name", "organizationId");

-- CreateIndex
CREATE INDEX "Project_id_organizationId_idx" ON "Project"("id", "organizationId");

-- CreateIndex
CREATE INDEX "Stage_id_organizationId_idx" ON "Stage"("id", "organizationId");

-- CreateIndex
CREATE INDEX "Task_id_organizationId_idx" ON "Task"("id", "organizationId");

-- CreateIndex
CREATE INDEX "TimeTracker_id_organizationId_idx" ON "TimeTracker"("id", "organizationId");
