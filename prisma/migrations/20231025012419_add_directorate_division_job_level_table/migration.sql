-- CreateTable
CREATE TABLE "Directorate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Directorate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "directorateId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePosition" (
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "jobLevelId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endAt" TIMESTAMP(3),

    CONSTRAINT "EmployeePosition_pkey" PRIMARY KEY ("userId","organizationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Directorate_name_organizationId_key" ON "Directorate"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Division_name_directorateId_key" ON "Division"("name", "directorateId");

-- AddForeignKey
ALTER TABLE "Directorate" ADD CONSTRAINT "Directorate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_directorateId_fkey" FOREIGN KEY ("directorateId") REFERENCES "Directorate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLevel" ADD CONSTRAINT "JobLevel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePosition" ADD CONSTRAINT "EmployeePosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePosition" ADD CONSTRAINT "EmployeePosition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePosition" ADD CONSTRAINT "EmployeePosition_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePosition" ADD CONSTRAINT "EmployeePosition_jobLevelId_fkey" FOREIGN KEY ("jobLevelId") REFERENCES "JobLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
