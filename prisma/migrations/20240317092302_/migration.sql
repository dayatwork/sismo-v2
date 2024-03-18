/*
  Warnings:

  - The primary key for the `DepartmentMember` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "DepartmentMember" DROP CONSTRAINT "DepartmentMember_pkey",
ADD CONSTRAINT "DepartmentMember_pkey" PRIMARY KEY ("userId", "departmentId");
