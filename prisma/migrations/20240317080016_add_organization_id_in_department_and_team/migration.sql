/*
  Warnings:

  - A unique constraint covering the columns `[userId,organizationId]` on the table `DepartmentMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `DepartmentMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DepartmentMember_userId_key";

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DepartmentMember" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "DepartmentMember_organizationId_departmentId_idx" ON "DepartmentMember"("organizationId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentMember_userId_organizationId_key" ON "DepartmentMember"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "TeamMember_organizationId_teamId_idx" ON "TeamMember"("organizationId", "teamId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentMember" ADD CONSTRAINT "DepartmentMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
