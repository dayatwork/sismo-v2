-- DropForeignKey
ALTER TABLE "PayrollTransaction" DROP CONSTRAINT "PayrollTransaction_payrollId_fkey";

-- AddForeignKey
ALTER TABLE "PayrollTransaction" ADD CONSTRAINT "PayrollTransaction_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
