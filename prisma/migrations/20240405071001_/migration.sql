/*
  Warnings:

  - Made the column `normalBalance` on table `ChartOfAccountClass` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChartOfAccountClass" ALTER COLUMN "normalBalance" SET NOT NULL;
