/*
  Warnings:

  - You are about to drop the column `content` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Mail` table. All the data in the column will be lost.
  - Added the required column `body` to the `Mail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Mail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mail" DROP COLUMN "content",
DROP COLUMN "title",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;
