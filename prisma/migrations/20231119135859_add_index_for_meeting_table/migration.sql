-- CreateIndex
CREATE INDEX "Meeting_organizationId_status_idx" ON "Meeting"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Meeting_organizationId_roomName_idx" ON "Meeting"("organizationId", "roomName");
