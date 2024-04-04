/*
  Warnings:

  - Added the required column `fixed` to the `Deduction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deduction" ADD COLUMN     "fixed" BOOLEAN NOT NULL;
