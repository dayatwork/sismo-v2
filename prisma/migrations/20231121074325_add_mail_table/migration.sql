/*
  Warnings:

  - You are about to drop the column `class` on the `ChartOfAccount` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ChartOfAccount` table. All the data in the column will be lost.
  - Added the required column `classId` to the `ChartOfAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeId` to the `ChartOfAccount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MailStatus" AS ENUM ('DRAFT', 'SENT', 'READ');

-- DropIndex
DROP INDEX "ChartOfAccount_organizationId_type_idx";

-- AlterTable
ALTER TABLE "ChartOfAccount" DROP COLUMN "class",
DROP COLUMN "type",
ADD COLUMN     "classId" TEXT NOT NULL,
ADD COLUMN     "typeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ChartOfAccountClass" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartOfAccountClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartOfAccountType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartOfAccountType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mail" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "senderId" TEXT NOT NULL,
    "status" "MailStatus" NOT NULL,

    CONSTRAINT "Mail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailAttachment" (
    "id" TEXT NOT NULL,
    "mailId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "MailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailReceiver" (
    "id" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "mailId" TEXT NOT NULL,

    CONSTRAINT "MailReceiver_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChartOfAccountClass_id_organizationId_idx" ON "ChartOfAccountClass"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccountClass_name_organizationId_key" ON "ChartOfAccountClass"("name", "organizationId");

-- CreateIndex
CREATE INDEX "Mail_organizationId_senderId_idx" ON "Mail"("organizationId", "senderId");

-- CreateIndex
CREATE INDEX "Mail_organizationId_senderId_status_idx" ON "Mail"("organizationId", "senderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MailReceiver_receiverId_mailId_key" ON "MailReceiver"("receiverId", "mailId");

-- CreateIndex
CREATE INDEX "ChartOfAccount_organizationId_typeId_idx" ON "ChartOfAccount"("organizationId", "typeId");

-- AddForeignKey
ALTER TABLE "ChartOfAccountClass" ADD CONSTRAINT "ChartOfAccountClass_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartOfAccountType" ADD CONSTRAINT "ChartOfAccountType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ChartOfAccountClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ChartOfAccountType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Mail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailAttachment" ADD CONSTRAINT "MailAttachment_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailReceiver" ADD CONSTRAINT "MailReceiver_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailReceiver" ADD CONSTRAINT "MailReceiver_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
