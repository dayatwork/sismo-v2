-- CreateEnum
CREATE TYPE "ProjectClosingReason" AS ENUM ('complete', 'cancel');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "championId" TEXT,
ADD COLUMN     "closingReason" "ProjectClosingReason";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_championId_fkey" FOREIGN KEY ("championId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
