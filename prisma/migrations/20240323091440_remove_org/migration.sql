/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `ChartOfAccount` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `ChartOfAccountClass` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `ChartOfAccountType` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `DepartmentMember` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Directorate` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Division` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `EmployeePosition` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `JobLevel` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Journal` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Milestone` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Stage` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `TimeTracker` table. All the data in the column will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `ChartOfAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ChartOfAccountClass` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Directorate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Division` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `JobLevel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referenceNumber]` on the table `Journal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ChartOfAccount" DROP CONSTRAINT "ChartOfAccount_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ChartOfAccountClass" DROP CONSTRAINT "ChartOfAccountClass_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ChartOfAccountType" DROP CONSTRAINT "ChartOfAccountType_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DepartmentMember" DROP CONSTRAINT "DepartmentMember_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Directorate" DROP CONSTRAINT "Directorate_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Division" DROP CONSTRAINT "Division_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeePosition" DROP CONSTRAINT "EmployeePosition_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "JobLevel" DROP CONSTRAINT "JobLevel_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Journal" DROP CONSTRAINT "Journal_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Mail" DROP CONSTRAINT "Mail_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationSettings" DROP CONSTRAINT "OrganizationSettings_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationUser" DROP CONSTRAINT "OrganizationUser_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationUser" DROP CONSTRAINT "OrganizationUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "TimeTracker" DROP CONSTRAINT "TimeTracker_organizationId_fkey";

-- DropIndex
DROP INDEX "Attachment_id_organizationId_idx";

-- DropIndex
DROP INDEX "ChartOfAccount_code_organizationId_key";

-- DropIndex
DROP INDEX "ChartOfAccount_organizationId_accountName_idx";

-- DropIndex
DROP INDEX "ChartOfAccount_organizationId_code_idx";

-- DropIndex
DROP INDEX "ChartOfAccount_organizationId_typeId_idx";

-- DropIndex
DROP INDEX "ChartOfAccountClass_id_organizationId_idx";

-- DropIndex
DROP INDEX "ChartOfAccountClass_name_organizationId_key";

-- DropIndex
DROP INDEX "Department_organizationId_id_idx";

-- DropIndex
DROP INDEX "Department_organizationId_name_idx";

-- DropIndex
DROP INDEX "DepartmentMember_organizationId_departmentId_idx";

-- DropIndex
DROP INDEX "Directorate_id_organizationId_idx";

-- DropIndex
DROP INDEX "Directorate_name_organizationId_key";

-- DropIndex
DROP INDEX "Division_id_organizationId_idx";

-- DropIndex
DROP INDEX "Division_name_directorateId_key";

-- DropIndex
DROP INDEX "Document_id_organizationId_idx";

-- DropIndex
DROP INDEX "Document_title_organizationId_idx";

-- DropIndex
DROP INDEX "Document_userId_organizationId_idx";

-- DropIndex
DROP INDEX "EmployeePosition_id_organizationId_idx";

-- DropIndex
DROP INDEX "EmployeePosition_userId_organizationId_key";

-- DropIndex
DROP INDEX "Expense_code_organizationId_key";

-- DropIndex
DROP INDEX "Expense_organizationId_chartOfAccountId_idx";

-- DropIndex
DROP INDEX "Expense_organizationId_projectId_idx";

-- DropIndex
DROP INDEX "Expense_organizationId_stageId_idx";

-- DropIndex
DROP INDEX "Expense_organizationId_status_idx";

-- DropIndex
DROP INDEX "JobLevel_id_organizationId_idx";

-- DropIndex
DROP INDEX "JobLevel_name_organizationId_key";

-- DropIndex
DROP INDEX "Journal_organizationId_chartOfAccountId_idx";

-- DropIndex
DROP INDEX "Journal_organizationId_id_idx";

-- DropIndex
DROP INDEX "Journal_referenceNumber_organizationId_key";

-- DropIndex
DROP INDEX "Mail_organizationId_receiverId_idx";

-- DropIndex
DROP INDEX "Mail_organizationId_senderId_idx";

-- DropIndex
DROP INDEX "Mail_organizationId_senderId_status_idx";

-- DropIndex
DROP INDEX "Meeting_organizationId_idx";

-- DropIndex
DROP INDEX "Meeting_organizationId_roomName_idx";

-- DropIndex
DROP INDEX "Meeting_organizationId_status_idx";

-- DropIndex
DROP INDEX "Milestone_organizationId_id_idx";

-- DropIndex
DROP INDEX "Milestone_organizationId_stageId_idx";

-- DropIndex
DROP INDEX "Product_id_organizationId_idx";

-- DropIndex
DROP INDEX "Product_organizationId_code_key";

-- DropIndex
DROP INDEX "Product_organizationId_idx";

-- DropIndex
DROP INDEX "Product_organizationId_name_key";

-- DropIndex
DROP INDEX "Product_parentId_organizationId_idx";

-- DropIndex
DROP INDEX "Project_code_organizationId_key";

-- DropIndex
DROP INDEX "Project_id_organizationId_idx";

-- DropIndex
DROP INDEX "Project_name_organizationId_key";

-- DropIndex
DROP INDEX "Service_id_organizationId_idx";

-- DropIndex
DROP INDEX "Service_organizationId_code_key";

-- DropIndex
DROP INDEX "Service_organizationId_idx";

-- DropIndex
DROP INDEX "Service_organizationId_name_key";

-- DropIndex
DROP INDEX "Stage_id_organizationId_idx";

-- DropIndex
DROP INDEX "Stage_projectId_organizationId_idx";

-- DropIndex
DROP INDEX "Task_id_organizationId_idx";

-- DropIndex
DROP INDEX "Team_organizationId_id_idx";

-- DropIndex
DROP INDEX "Team_organizationId_name_idx";

-- DropIndex
DROP INDEX "TeamMember_organizationId_teamId_idx";

-- DropIndex
DROP INDEX "TimeTracker_id_organizationId_idx";

-- DropIndex
DROP INDEX "TimeTracker_id_organizationId_userId_idx";

-- DropIndex
DROP INDEX "TimeTracker_id_organizationId_userId_year_idx";

-- DropIndex
DROP INDEX "TimeTracker_id_organizationId_year_idx";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "ChartOfAccount" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "ChartOfAccountClass" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "ChartOfAccountType" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "DepartmentMember" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Directorate" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Division" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "EmployeePosition" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "JobLevel" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Journal" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Mail" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Stage" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "TimeTracker" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "memberStatus" "MemberStatus";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "OrganizationSettings";

-- DropTable
DROP TABLE "OrganizationUser";

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "allowEditTimeTracker" BOOLEAN NOT NULL DEFAULT false,
    "timeTrackerEditLimitInDays" SMALLINT,
    "timeTrackerLimited" BOOLEAN NOT NULL DEFAULT true,
    "maxTimeTrackerInHours" SMALLINT DEFAULT 4,
    "allowClockinWithNewTask" BOOLEAN NOT NULL DEFAULT true,
    "allowClockinWithUnplannedTasks" BOOLEAN NOT NULL DEFAULT true,
    "requireUploadAttachmentBeforeClockIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attachment_userId_idx" ON "Attachment"("userId");

-- CreateIndex
CREATE INDEX "Attachment_taskId_idx" ON "Attachment"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccount_code_key" ON "ChartOfAccount"("code");

-- CreateIndex
CREATE INDEX "ChartOfAccount_accountName_idx" ON "ChartOfAccount"("accountName");

-- CreateIndex
CREATE INDEX "ChartOfAccount_typeId_idx" ON "ChartOfAccount"("typeId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccountClass_name_key" ON "ChartOfAccountClass"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "DepartmentMember_departmentId_idx" ON "DepartmentMember"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Directorate_name_key" ON "Directorate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Division_name_key" ON "Division"("name");

-- CreateIndex
CREATE INDEX "Document_title_idx" ON "Document"("title");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "EmployeePosition_userId_idx" ON "EmployeePosition"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_code_key" ON "Expense"("code");

-- CreateIndex
CREATE INDEX "Expense_projectId_idx" ON "Expense"("projectId");

-- CreateIndex
CREATE INDEX "Expense_stageId_idx" ON "Expense"("stageId");

-- CreateIndex
CREATE INDEX "Expense_status_idx" ON "Expense"("status");

-- CreateIndex
CREATE INDEX "Expense_chartOfAccountId_idx" ON "Expense"("chartOfAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "JobLevel_name_key" ON "JobLevel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Journal_referenceNumber_key" ON "Journal"("referenceNumber");

-- CreateIndex
CREATE INDEX "Journal_chartOfAccountId_idx" ON "Journal"("chartOfAccountId");

-- CreateIndex
CREATE INDEX "Mail_senderId_idx" ON "Mail"("senderId");

-- CreateIndex
CREATE INDEX "Mail_senderId_status_idx" ON "Mail"("senderId", "status");

-- CreateIndex
CREATE INDEX "Mail_receiverId_idx" ON "Mail"("receiverId");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

-- CreateIndex
CREATE INDEX "Milestone_stageId_idx" ON "Milestone"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE INDEX "Product_parentId_idx" ON "Product"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Service_code_key" ON "Service"("code");

-- CreateIndex
CREATE INDEX "Stage_projectId_idx" ON "Stage"("projectId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- CreateIndex
CREATE INDEX "TimeTracker_userId_idx" ON "TimeTracker"("userId");

-- CreateIndex
CREATE INDEX "TimeTracker_year_idx" ON "TimeTracker"("year");

-- CreateIndex
CREATE INDEX "TimeTracker_userId_year_idx" ON "TimeTracker"("userId", "year");

-- CreateIndex
CREATE INDEX "TrackerItem_taskId_idx" ON "TrackerItem"("taskId");

-- CreateIndex
CREATE INDEX "TrackerItem_timeTrackerId_idx" ON "TrackerItem"("timeTrackerId");
