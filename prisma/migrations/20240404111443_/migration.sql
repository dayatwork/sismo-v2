/*
  Warnings:

  - Added the required column `fixed` to the `SupplementalWage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SupplementalWage" ADD COLUMN     "fixed" BOOLEAN NOT NULL;
