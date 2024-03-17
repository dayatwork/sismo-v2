/*
  Warnings:

  - The primary key for the `OrganizationUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organizationId,userId]` on the table `OrganizationUser` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `OrganizationUser` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- AlterTable
ALTER TABLE "OrganizationUser" DROP CONSTRAINT "OrganizationUser_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "OrganizationUser_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "UserRole";

-- CreateTable
CREATE TABLE "_OrganizationUserToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationUserToRole_AB_unique" ON "_OrganizationUserToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationUserToRole_B_index" ON "_OrganizationUserToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationUser_organizationId_userId_key" ON "OrganizationUser"("organizationId", "userId");

-- AddForeignKey
ALTER TABLE "_OrganizationUserToRole" ADD CONSTRAINT "_OrganizationUserToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "OrganizationUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationUserToRole" ADD CONSTRAINT "_OrganizationUserToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
