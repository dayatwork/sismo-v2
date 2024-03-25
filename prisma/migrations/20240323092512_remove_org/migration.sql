/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Client_id_organizationId_idx";

-- DropIndex
DROP INDEX "Client_organizationId_code_key";

-- DropIndex
DROP INDEX "Client_organizationId_name_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "organizationId";

-- CreateIndex
CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Client_code_key" ON "Client"("code");
