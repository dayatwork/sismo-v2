import { type Prisma } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function getExpenses() {
  const expenses = await prisma.expense.findMany({
    orderBy: { submittedAt: "desc" },
    include: {
      chartOfAccount: { include: { type: true } },
      project: { select: { id: true, name: true } },
      stage: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true, photo: true } },
      submittedBy: { select: { id: true, name: true, photo: true } },
      rejectedBy: { select: { id: true, name: true, photo: true } },
    },
  });
  return expenses;
}

export async function getExpenseById({ expenseId }: { expenseId: string }) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      chartOfAccount: true,
      project: { select: { id: true, name: true } },
      stage: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true, photo: true } },
      submittedBy: { select: { id: true, name: true, photo: true } },
      rejectedBy: { select: { id: true, name: true, photo: true } },
    },
  });
  return expense;
}

export async function submitExpense({
  amount,
  chartOfAccountId,
  code,
  currency,
  description,
  quantity,
  note,
  projectId,
  stageId,
  submittedById,
  unitPrice,
}: {
  projectId?: string;
  stageId?: string;
  quantity: number;
  amount: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  currency: "IDR" | "USD";
  note?: string;
  submittedById: string;
  description?: string;
  chartOfAccountId?: string;
  code: string;
}) {
  const expense = await prisma.expense.create({
    data: {
      projectId,
      stageId,
      amount,
      currency,
      unitPrice,
      description,
      chartOfAccountId,
      status: "SUBMITTED",
      submittedById,
      submittedAt: new Date(),
      note,
      quantity,
      code,
    },
  });
  return expense;
}

export async function approveExpense({
  expenseId,
  note,
  approvedById,
}: {
  expenseId: string;
  approvedById: string;
  note?: string;
}) {
  const expense = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      note,
      approvedById,
      approvedAt: new Date(),
      status: "APPROVED",
      rejectedAt: null,
      rejectedById: null,
    },
  });
  return expense;
}

export async function rejectExpense({
  expenseId,
  note,
  rejectedById,
}: {
  expenseId: string;
  rejectedById: string;
  note?: string;
}) {
  const expense = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      note,
      rejectedById,
      rejectedAt: new Date(),
      status: "REJECTED",
      approvedAt: null,
      approvedById: null,
    },
  });
  return expense;
}

export async function editExpense({
  amount,
  currency,
  expenseId,
  quantity,
  note,
  projectId,
  stageId,
  submittedById,
}: {
  expenseId: string;
  projectId?: string;
  stageId?: string;
  quantity: number;
  amount: Prisma.Decimal;
  currency: "IDR" | "USD";
  note?: string;
  submittedById: string;
}) {
  const expense = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      projectId,
      stageId,
      amount,
      currency,
      status: "SUBMITTED",
      submittedById,
      submittedAt: new Date(),
      approvedAt: null,
      approvedById: null,
      rejectedById: null,
      note,
      quantity,
    },
  });
  return expense;
}

export async function editExpenseChartOfAccount({
  chartOfAccountId,
  expenseId,
}: {
  expenseId: string;
  chartOfAccountId: string;
}) {
  const expense = await prisma.expense.update({
    where: { id: expenseId },
    data: { chartOfAccountId },
  });
  return expense;
}

export async function deleteExpense({ expenseId }: { expenseId: string }) {
  const expense = await prisma.expense.delete({
    where: { id: expenseId },
  });
  return expense;
}
