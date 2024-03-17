/*
  Warnings:

  - You are about to drop the `_OrganizationUserToRole` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `organizationId` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_OrganizationUserToRole" DROP CONSTRAINT "_OrganizationUserToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationUserToRole" DROP CONSTRAINT "_OrganizationUserToRole_B_fkey";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_OrganizationUserToRole";

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
