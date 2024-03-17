/*
  Warnings:

  - The values [complete,cancel] on the enum `ProjectClosingReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectClosingReason_new" AS ENUM ('COMPLETE', 'CANCEL');
ALTER TABLE "Project" ALTER COLUMN "closingReason" TYPE "ProjectClosingReason_new" USING ("closingReason"::text::"ProjectClosingReason_new");
ALTER TYPE "ProjectClosingReason" RENAME TO "ProjectClosingReason_old";
ALTER TYPE "ProjectClosingReason_new" RENAME TO "ProjectClosingReason";
DROP TYPE "ProjectClosingReason_old";
COMMIT;
