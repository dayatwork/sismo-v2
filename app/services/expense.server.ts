import { type Prisma } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function getExpenses({
  organizationId,
}: {
  organizationId: string;
}) {
  const expenses = await prisma.expense.findMany({
    where: { organizationId },
    orderBy: { submittedAt: "desc" },
    include: {
      chartOfAccount: true,
      project: { select: { id: true, name: true } },
      stage: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true, photo: true } },
      submittedBy: { select: { id: true, name: true, photo: true } },
      rejectedBy: { select: { id: true, name: true, photo: true } },
    },
  });
  return expenses;
}

export async function getExpenseById({
  organizationId,
  expenseId,
}: {
  organizationId: string;
  expenseId: string;
}) {
  const expense = await prisma.expense.findUnique({
    where: { organizationId, id: expenseId },
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
  organizationId,
  submittedById,
  unitPrice,
}: {
  organizationId: string;
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
      organizationId,
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
  organizationId,
  approvedById,
}: {
  organizationId: string;
  expenseId: string;
  approvedById: string;
  note?: string;
}) {
  const expense = await prisma.expense.update({
    where: { id: expenseId, organizationId },
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
  organizationId,
  rejectedById,
}: {
  organizationId: string;
  expenseId: string;
  rejectedById: string;
  note?: string;
}) {
  const expense = await prisma.expense.update({
    where: { id: expenseId, organizationId },
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
  organizationId,
  submittedById,
}: {
  expenseId: string;
  organizationId: string;
  projectId?: string;
  stageId?: string;
  quantity: number;
  amount: Prisma.Decimal;
  currency: "IDR" | "USD";
  note?: string;
  submittedById: string;
}) {
  const expense = await prisma.expense.update({
    where: { id: expenseId, organizationId },
    data: {
      organizationId,
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
  organizationId,
}: {
  expenseId: string;
  organizationId: string;
  chartOfAccountId: string;
}) {
  const expense = await prisma.expense.update({
    where: { id: expenseId, organizationId },
    data: { chartOfAccountId },
  });
  return expense;
}

export async function deleteExpense({
  organizationId,
  expenseId,
}: {
  expenseId: string;
  organizationId: string;
}) {
  const expense = await prisma.expense.delete({
    where: { id: expenseId, organizationId },
  });
  return expense;
}
