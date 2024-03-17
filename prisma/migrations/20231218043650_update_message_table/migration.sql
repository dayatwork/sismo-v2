/*
  Warnings:

  - You are about to drop the column `image` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MailAttachment" DROP CONSTRAINT "MailAttachment_mailId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "image",
ADD COLUMN     "fileUrl" TEXT;

-- AddForeignKey
ALTER TABLE "MailAttachment" ADD CONSTRAINT "MailAttachment_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
