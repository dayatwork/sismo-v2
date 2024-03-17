/*
  Warnings:

  - The primary key for the `EmployeePosition` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,organizationId]` on the table `EmployeePosition` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `EmployeePosition` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "EmployeePosition" DROP CONSTRAINT "EmployeePosition_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "EmployeePosition_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePosition_userId_organizationId_key" ON "EmployeePosition"("userId", "organizationId");
