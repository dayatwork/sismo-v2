/*
  Warnings:

  - Added the required column `unitPrice` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "unitPrice" DECIMAL(65,30) NOT NULL;
