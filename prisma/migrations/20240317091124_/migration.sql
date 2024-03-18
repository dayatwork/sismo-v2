-- DropIndex
DROP INDEX "DepartmentMember_userId_organizationId_key";

-- AlterTable
ALTER TABLE "DepartmentMember" ADD CONSTRAINT "DepartmentMember_pkey" PRIMARY KEY ("userId", "organizationId");
