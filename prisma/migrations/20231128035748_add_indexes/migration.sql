-- CreateIndex
CREATE INDEX "TimeTracker_id_organizationId_userId_idx" ON "TimeTracker"("id", "organizationId", "userId");

-- CreateIndex
CREATE INDEX "TimeTracker_id_organizationId_year_idx" ON "TimeTracker"("id", "organizationId", "year");

-- CreateIndex
CREATE INDEX "TimeTracker_id_organizationId_userId_year_idx" ON "TimeTracker"("id", "organizationId", "userId", "year");

-- CreateIndex
CREATE INDEX "TrackerItem_timeTrackerId_taskId_idx" ON "TrackerItem"("timeTrackerId", "taskId");
