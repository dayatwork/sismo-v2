-- CreateEnum
CREATE TYPE "WorkspacePrivacy" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "BoardPrivacy" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "BoardStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "BoardTaskStatus" AS ENUM ('DONE', 'IN_PROGRESS', 'TODO', 'BACKLOG', 'STUCK', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "BoardTaskPriority" AS ENUM ('NO_PRIORITY', 'URGENT', 'HIGH', 'MEDIUM', 'LOW');

-- DropForeignKey
ALTER TABLE "DepartmentMember" DROP CONSTRAINT "DepartmentMember_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "DepartmentMember" DROP CONSTRAINT "DepartmentMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "privacy" "WorkspacePrivacy" NOT NULL,
    "status" "WorkspaceStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "icon" TEXT,
    "brandColor" TEXT,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceRole" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "WorkspaceRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("userId","workspaceId")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "privacy" "BoardPrivacy" NOT NULL,
    "status" "BoardStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardMember" (
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BoardMember_pkey" PRIMARY KEY ("boardId","userId")
);

-- CreateTable
CREATE TABLE "BoardTaskGroup" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "BoardTaskGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardTask" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "BoardTaskStatus" NOT NULL DEFAULT 'BACKLOG',
    "priority" "BoardTaskPriority" NOT NULL DEFAULT 'NO_PRIORITY',
    "ownerId" TEXT NOT NULL,
    "boardId" TEXT,
    "groupId" TEXT,
    "timelineStart" TIMESTAMP(3),
    "timelineEnd" TIMESTAMP(3),
    "plannedEffortInMinutes" INTEGER,
    "effortSpentInMinutes" INTEGER,
    "completionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentTaskId" TEXT,

    CONSTRAINT "BoardTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTracker" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endAt" TIMESTAMP(3),
    "week" SMALLINT NOT NULL,
    "year" SMALLINT NOT NULL,

    CONSTRAINT "TaskTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTrackerItem" (
    "id" TEXT NOT NULL,
    "trackerId" TEXT NOT NULL,
    "taskId" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "taskCompletion" SMALLINT NOT NULL,
    "workDurationInMinutes" SMALLINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTrackerItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttachmentV2" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "trackerItemId" TEXT,
    "taskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttachmentV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Dependency" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Workspace_name_idx" ON "Workspace"("name");

-- CreateIndex
CREATE INDEX "WorkspaceRole_workspaceId_idx" ON "WorkspaceRole"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceRole_workspaceId_name_key" ON "WorkspaceRole"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "Board_workspaceId_idx" ON "Board"("workspaceId");

-- CreateIndex
CREATE INDEX "Board_name_idx" ON "Board"("name");

-- CreateIndex
CREATE INDEX "Board_workspaceId_name_idx" ON "Board"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "BoardTaskGroup_boardId_idx" ON "BoardTaskGroup"("boardId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardTaskGroup_boardId_name_key" ON "BoardTaskGroup"("boardId", "name");

-- CreateIndex
CREATE INDEX "BoardTask_boardId_idx" ON "BoardTask"("boardId");

-- CreateIndex
CREATE INDEX "BoardTask_ownerId_idx" ON "BoardTask"("ownerId");

-- CreateIndex
CREATE INDEX "BoardTask_ownerId_boardId_idx" ON "BoardTask"("ownerId", "boardId");

-- CreateIndex
CREATE INDEX "TaskTracker_ownerId_idx" ON "TaskTracker"("ownerId");

-- CreateIndex
CREATE INDEX "TaskTracker_ownerId_week_year_idx" ON "TaskTracker"("ownerId", "week", "year");

-- CreateIndex
CREATE INDEX "TaskTrackerItem_taskId_idx" ON "TaskTrackerItem"("taskId");

-- CreateIndex
CREATE INDEX "TaskTrackerItem_trackerId_idx" ON "TaskTrackerItem"("trackerId");

-- CreateIndex
CREATE INDEX "AttachmentV2_trackerItemId_idx" ON "AttachmentV2"("trackerItemId");

-- CreateIndex
CREATE INDEX "AttachmentV2_taskId_idx" ON "AttachmentV2"("taskId");

-- CreateIndex
CREATE INDEX "AttachmentV2_ownerId_idx" ON "AttachmentV2"("ownerId");

-- CreateIndex
CREATE INDEX "AttachmentV2_displayName_idx" ON "AttachmentV2"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "_Dependency_AB_unique" ON "_Dependency"("A", "B");

-- CreateIndex
CREATE INDEX "_Dependency_B_index" ON "_Dependency"("B");

-- AddForeignKey
ALTER TABLE "DepartmentMember" ADD CONSTRAINT "DepartmentMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentMember" ADD CONSTRAINT "DepartmentMember_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceRole" ADD CONSTRAINT "WorkspaceRole_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "WorkspaceRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardTaskGroup" ADD CONSTRAINT "BoardTaskGroup_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardTask" ADD CONSTRAINT "BoardTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardTask" ADD CONSTRAINT "BoardTask_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardTask" ADD CONSTRAINT "BoardTask_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BoardTaskGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardTask" ADD CONSTRAINT "BoardTask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "BoardTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTracker" ADD CONSTRAINT "TaskTracker_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTrackerItem" ADD CONSTRAINT "TaskTrackerItem_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "TaskTracker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTrackerItem" ADD CONSTRAINT "TaskTrackerItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "BoardTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentV2" ADD CONSTRAINT "AttachmentV2_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentV2" ADD CONSTRAINT "AttachmentV2_trackerItemId_fkey" FOREIGN KEY ("trackerItemId") REFERENCES "TaskTrackerItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentV2" ADD CONSTRAINT "AttachmentV2_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "BoardTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Dependency" ADD CONSTRAINT "_Dependency_A_fkey" FOREIGN KEY ("A") REFERENCES "BoardTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Dependency" ADD CONSTRAINT "_Dependency_B_fkey" FOREIGN KEY ("B") REFERENCES "BoardTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
