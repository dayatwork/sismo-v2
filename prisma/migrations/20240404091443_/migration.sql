-- CreateEnum
CREATE TYPE "RegularWageType" AS ENUM ('SALARY', 'HOURLY');

-- CreateEnum
CREATE TYPE "TransactionItemType" AS ENUM ('WAGE', 'DEDUCTION');

-- CreateTable
CREATE TABLE "RegularWage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RegularWageType" NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "RegularWage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegularWageHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RegularWageType" NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "RegularWageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeWage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "OvertimeWage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementalWageName" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SupplementalWageName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementalWage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "SupplementalWage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeductionName" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DeductionName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deduction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollTransaction" (
    "id" TEXT NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" SMALLINT NOT NULL,
    "userId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollTransactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "type" "TransactionItemType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "editable" BOOLEAN NOT NULL,

    CONSTRAINT "PayrollTransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegularWage_userId_key" ON "RegularWage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OvertimeWage_userId_key" ON "OvertimeWage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplementalWageName_name_key" ON "SupplementalWageName"("name");

-- CreateIndex
CREATE INDEX "PayrollTransaction_userId_idx" ON "PayrollTransaction"("userId");

-- CreateIndex
CREATE INDEX "PayrollTransaction_month_year_idx" ON "PayrollTransaction"("month", "year");

-- CreateIndex
CREATE INDEX "PayrollTransaction_month_year_userId_idx" ON "PayrollTransaction"("month", "year", "userId");

-- CreateIndex
CREATE INDEX "PayrollTransactionItem_transactionId_idx" ON "PayrollTransactionItem"("transactionId");

-- AddForeignKey
ALTER TABLE "RegularWage" ADD CONSTRAINT "RegularWage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularWageHistory" ADD CONSTRAINT "RegularWageHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeWage" ADD CONSTRAINT "OvertimeWage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementalWage" ADD CONSTRAINT "SupplementalWage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementalWage" ADD CONSTRAINT "SupplementalWage_nameId_fkey" FOREIGN KEY ("nameId") REFERENCES "SupplementalWageName"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deduction" ADD CONSTRAINT "Deduction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deduction" ADD CONSTRAINT "Deduction_nameId_fkey" FOREIGN KEY ("nameId") REFERENCES "DeductionName"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTransaction" ADD CONSTRAINT "PayrollTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTransactionItem" ADD CONSTRAINT "PayrollTransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "PayrollTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
