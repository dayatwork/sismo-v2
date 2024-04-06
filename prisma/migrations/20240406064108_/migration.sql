/*
  Warnings:

  - A unique constraint covering the columns `[journalEntryId,accountId]` on the table `JournalEntryLine` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JournalEntryLine_journalEntryId_accountId_key" ON "JournalEntryLine"("journalEntryId", "accountId");
