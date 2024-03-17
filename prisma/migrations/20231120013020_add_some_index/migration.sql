-- DropForeignKey
ALTER TABLE "MeetingParticipant" DROP CONSTRAINT "MeetingParticipant_meetingId_fkey";

-- CreateIndex
CREATE INDEX "ChartOfAccount_organizationId_code_idx" ON "ChartOfAccount"("organizationId", "code");

-- CreateIndex
CREATE INDEX "ChartOfAccount_organizationId_type_idx" ON "ChartOfAccount"("organizationId", "type");

-- CreateIndex
CREATE INDEX "ChartOfAccount_organizationId_accountName_idx" ON "ChartOfAccount"("organizationId", "accountName");

-- AddForeignKey
ALTER TABLE "MeetingParticipant" ADD CONSTRAINT "MeetingParticipant_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
