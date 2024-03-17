/*
  Warnings:

  - A unique constraint covering the columns `[code,organizationId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "code" TEXT;

-- CreateIndex
CREATE INDEX "Expense_organizationId_projectId_idx" ON "Expense"("organizationId", "projectId");

-- CreateIndex
CREATE INDEX "Expense_organizationId_stageId_idx" ON "Expense"("organizationId", "stageId");

-- CreateIndex
CREATE INDEX "Expense_organizationId_status_idx" ON "Expense"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Expense_organizationId_chartOfAccountId_idx" ON "Expense"("organizationId", "chartOfAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_code_organizationId_key" ON "Expense"("code", "organizationId");
