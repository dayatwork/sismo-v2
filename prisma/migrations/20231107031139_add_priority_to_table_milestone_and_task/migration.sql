-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('NO_PRIORITY', 'URGENT', 'HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "description" TEXT,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'NO_PRIORITY';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'NO_PRIORITY';

-- CreateIndex
CREATE INDEX "Milestone_organizationId_id_idx" ON "Milestone"("organizationId", "id");

-- CreateIndex
CREATE INDEX "Milestone_organizationId_stageId_idx" ON "Milestone"("organizationId", "stageId");
