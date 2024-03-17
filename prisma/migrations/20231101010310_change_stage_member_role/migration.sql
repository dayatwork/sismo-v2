/*
  Warnings:

  - The values [pic,member] on the enum `StageMemberRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StageMemberRole_new" AS ENUM ('PIC', 'MEMBER');
ALTER TABLE "StageMember" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "StageMember" ALTER COLUMN "role" TYPE "StageMemberRole_new" USING ("role"::text::"StageMemberRole_new");
ALTER TYPE "StageMemberRole" RENAME TO "StageMemberRole_old";
ALTER TYPE "StageMemberRole_new" RENAME TO "StageMemberRole";
DROP TYPE "StageMemberRole_old";
ALTER TABLE "StageMember" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterTable
ALTER TABLE "StageMember" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
