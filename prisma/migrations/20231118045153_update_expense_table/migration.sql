/*
  Warnings:

  - Added the required column `description` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "description" TEXT NOT NULL;
