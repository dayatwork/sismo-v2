/*
  Warnings:

  - You are about to drop the column `month` on the `PayrollTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `PayrollTransaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[payrollId,userId]` on the table `PayrollTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payrollId` to the `PayrollTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PayrollType" AS ENUM ('MONTHLY_SALARY', 'RELIGIOUS_HOLIDAY_ALLOWANCE');

-- DropIndex
DROP INDEX "PayrollTransaction_month_year_idx";

-- DropIndex
DROP INDEX "PayrollTransaction_month_year_userId_idx";

-- AlterTable
ALTER TABLE "PayrollTransaction" DROP COLUMN "month",
DROP COLUMN "year",
ADD COLUMN     "payrollId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Payroll" (
    "id" TEXT NOT NULL,
    "type" "PayrollType" NOT NULL,
    "code" TEXT NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" SMALLINT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_code_key" ON "Payroll"("code");

-- CreateIndex
CREATE INDEX "PayrollTransaction_payrollId_idx" ON "PayrollTransaction"("payrollId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollTransaction_payrollId_userId_key" ON "PayrollTransaction"("payrollId", "userId");

-- AddForeignKey
ALTER TABLE "PayrollTransaction" ADD CONSTRAINT "PayrollTransaction_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
