/*
  Warnings:

  - A unique constraint covering the columns `[entryNumber]` on the table `JournalEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_entryNumber_key" ON "JournalEntry"("entryNumber");
