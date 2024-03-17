/*
  Warnings:

  - A unique constraint covering the columns `[referenceNumber,organizationId]` on the table `Journal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Journal_organizationId_id_idx" ON "Journal"("organizationId", "id");

-- CreateIndex
CREATE INDEX "Journal_organizationId_chartOfAccountId_idx" ON "Journal"("organizationId", "chartOfAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Journal_referenceNumber_organizationId_key" ON "Journal"("referenceNumber", "organizationId");
