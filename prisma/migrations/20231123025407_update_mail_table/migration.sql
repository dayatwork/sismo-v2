/*
  Warnings:

  - Added the required column `code` to the `Mail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mail" ADD COLUMN     "code" TEXT NOT NULL;
