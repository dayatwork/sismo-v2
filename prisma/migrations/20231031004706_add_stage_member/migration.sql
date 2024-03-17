-- CreateEnum
CREATE TYPE "StageMemberRole" AS ENUM ('pic', 'member');

-- CreateTable
CREATE TABLE "StageMember" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "StageMemberRole" NOT NULL DEFAULT 'member',

    CONSTRAINT "StageMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StageMember_stageId_userId_key" ON "StageMember"("stageId", "userId");

-- AddForeignKey
ALTER TABLE "StageMember" ADD CONSTRAINT "StageMember_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageMember" ADD CONSTRAINT "StageMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
