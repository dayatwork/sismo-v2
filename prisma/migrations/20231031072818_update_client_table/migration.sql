/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,name]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,code]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Client_code_key";

-- DropIndex
DROP INDEX "Client_name_key";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_organizationId_name_key" ON "Client"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Client_organizationId_code_key" ON "Client"("organizationId", "code");
