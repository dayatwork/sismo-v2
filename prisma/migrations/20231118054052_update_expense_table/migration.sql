-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';
