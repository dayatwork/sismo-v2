/*
  Warnings:

  - You are about to drop the `MailReceiver` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MailReceiver" DROP CONSTRAINT "MailReceiver_mailId_fkey";

-- DropForeignKey
ALTER TABLE "MailReceiver" DROP CONSTRAINT "MailReceiver_receiverId_fkey";

-- AlterTable
ALTER TABLE "Mail" ADD COLUMN     "receiverId" TEXT,
ALTER COLUMN "subject" DROP NOT NULL;

-- DropTable
DROP TABLE "MailReceiver";

-- CreateIndex
CREATE INDEX "Mail_organizationId_receiverId_idx" ON "Mail"("organizationId", "receiverId");

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
