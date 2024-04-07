-- AlterTable
ALTER TABLE "ChartOfAccountCategory" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "ChartOfAccountCategory" ADD CONSTRAINT "ChartOfAccountCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ChartOfAccountCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
