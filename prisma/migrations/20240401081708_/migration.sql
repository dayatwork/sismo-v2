/*
  Warnings:

  - You are about to drop the column `projectId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `stageId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Directorate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Division` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeePosition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobLevel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MailAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Milestone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectClient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StageMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimeTracker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackerItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_stageId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_trackerItemId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Division" DROP CONSTRAINT "Division_directorateId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeePosition" DROP CONSTRAINT "EmployeePosition_divisionId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeePosition" DROP CONSTRAINT "EmployeePosition_jobLevelId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeePosition" DROP CONSTRAINT "EmployeePosition_userId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_stageId_fkey";

-- DropForeignKey
ALTER TABLE "Mail" DROP CONSTRAINT "Mail_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Mail" DROP CONSTRAINT "Mail_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Mail" DROP CONSTRAINT "Mail_senderId_fkey";

-- DropForeignKey
ALTER TABLE "MailAttachment" DROP CONSTRAINT "MailAttachment_mailId_fkey";

-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_stageId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_championId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_productId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectClient" DROP CONSTRAINT "ProjectClient_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectClient" DROP CONSTRAINT "ProjectClient_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_projectId_fkey";

-- DropForeignKey
ALTER TABLE "StageMember" DROP CONSTRAINT "StageMember_stageId_fkey";

-- DropForeignKey
ALTER TABLE "StageMember" DROP CONSTRAINT "StageMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_stageId_fkey";

-- DropForeignKey
ALTER TABLE "TimeTracker" DROP CONSTRAINT "TimeTracker_userId_fkey";

-- DropForeignKey
ALTER TABLE "TrackerItem" DROP CONSTRAINT "TrackerItem_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TrackerItem" DROP CONSTRAINT "TrackerItem_timeTrackerId_fkey";

-- DropIndex
DROP INDEX "Expense_projectId_idx";

-- DropIndex
DROP INDEX "Expense_stageId_idx";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "projectId",
DROP COLUMN "stageId";

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "Directorate";

-- DropTable
DROP TABLE "Division";

-- DropTable
DROP TABLE "EmployeePosition";

-- DropTable
DROP TABLE "JobLevel";

-- DropTable
DROP TABLE "Mail";

-- DropTable
DROP TABLE "MailAttachment";

-- DropTable
DROP TABLE "Milestone";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ProjectClient";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "Stage";

-- DropTable
DROP TABLE "StageMember";

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "TimeTracker";

-- DropTable
DROP TABLE "TrackerItem";

-- DropEnum
DROP TYPE "MailStatus";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "ProjectClosingReason";

-- DropEnum
DROP TYPE "ProjectStatus";

-- DropEnum
DROP TYPE "StageMemberRole";

-- DropEnum
DROP TYPE "StageStatus";

-- DropEnum
DROP TYPE "TaskStatus";

-- DropEnum
DROP TYPE "TaskType";
