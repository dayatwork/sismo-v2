/*
  Warnings:

  - Made the column `code` on table `Expense` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "code" SET NOT NULL;
