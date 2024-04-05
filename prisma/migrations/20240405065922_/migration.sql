-- AlterTable
ALTER TABLE "ChartOfAccount" ADD COLUMN     "openingBalance" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ChartOfAccountClass" ADD COLUMN     "normalBalance" "NormalBalance";
