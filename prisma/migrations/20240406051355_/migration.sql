-- DropForeignKey
ALTER TABLE "ChartOfAccountType" DROP CONSTRAINT "ChartOfAccountType_classId_fkey";

-- AlterTable
ALTER TABLE "ChartOfAccountType" ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "classId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ChartOfAccountCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalBalance" "NormalBalance" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartOfAccountCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccountCategory_name_key" ON "ChartOfAccountCategory"("name");

-- AddForeignKey
ALTER TABLE "ChartOfAccountType" ADD CONSTRAINT "ChartOfAccountType_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ChartOfAccountClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartOfAccountType" ADD CONSTRAINT "ChartOfAccountType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ChartOfAccountCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
