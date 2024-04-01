/*
  Warnings:

  - Added the required column `type` to the `AttachmentV2` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttachmentV2" ADD COLUMN     "type" "AttachmentType" NOT NULL;
