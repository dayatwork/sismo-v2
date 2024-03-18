-- CreateIndex
CREATE INDEX "Department_organizationId_id_idx" ON "Department"("organizationId", "id");

-- CreateIndex
CREATE INDEX "Department_organizationId_name_idx" ON "Department"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Team_organizationId_id_idx" ON "Team"("organizationId", "id");

-- CreateIndex
CREATE INDEX "Team_organizationId_name_idx" ON "Team"("organizationId", "name");
