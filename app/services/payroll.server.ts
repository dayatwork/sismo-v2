import { type TransactionItemType, type PayrollType } from "@prisma/client";

import prisma from "~/lib/prisma";

export async function createPayroll({
  type,
  month,
  year,
  code: _code,
  note,
}: {
  type: PayrollType;
  month: number;
  year: number;
  code?: string;
  note?: string;
}) {
  const code =
    _code || `P${type === "MONTHLY_SALARY" ? "1" : "2"}-${year}${month}`;

  const payroll = await prisma.payroll.create({
    data: { type, month, year, code, note },
  });

  return payroll;
}

type GetPayrollsProps = {
  month?: number;
  year?: number;
  type?: PayrollType;
};
export async function getPayrolls(props?: GetPayrollsProps) {
  const payrolls = await prisma.payroll.findMany({
    where: { month: props?.month, year: props?.year, type: props?.type },
    include: { transactions: true },
  });

  return payrolls;
}

export async function getPayrollById({ payrollId }: { payrollId: string }) {
  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
    include: {
      transactions: {
        include: {
          user: { select: { id: true, name: true, photo: true } },
          transactionItems: true,
        },
      },
    },
  });
  return payroll;
}

export async function generatePayrollTransactionForAllUsers({
  payrollId,
}: {
  payrollId: string;
}) {
  await prisma.payrollTransaction.deleteMany({ where: { payrollId } });

  const payroll = await prisma.payroll.findUniqueOrThrow({
    where: { id: payrollId },
  });

  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      taskTrackers: {
        where: {
          month: payroll.month,
          year: payroll.year,
          endAt: { not: null },
          approved: true,
        },
      },
      regularWage: true,
      overtimeWage: true,
      supplementalWages: { include: { name: true } },
      deductions: { include: { name: true } },
    },
  });

  const usersData = users.map((user) => {
    const totalWorkingHours = user.taskTrackers.reduce(
      (acc, curr) =>
        acc +
        (new Date(curr.endAt!).getTime() - new Date(curr.startAt).getTime()) /
          3600000,
      0
    );

    const transactionItemsData: {
      type: TransactionItemType;
      amount: number;
      note?: string;
      editable: boolean;
    }[] = [];

    // REGULAR WAGE
    if (user.regularWage) {
      if (user.regularWage.type === "HOURLY") {
        transactionItemsData.push({
          amount: totalWorkingHours * user.regularWage.amount,
          editable: false,
          type: "WAGE",
          note: "Regular wage",
        });
      } else {
        transactionItemsData.push({
          amount: user.regularWage.amount,
          editable: false,
          type: "WAGE",
          note: "Regular wage",
        });
      }
    }

    // TODO: OVERTIME WAGE

    // SUPPLEMENTAL WAGES
    user.supplementalWages.forEach((sw) => {
      transactionItemsData.push({
        amount: sw.amount,
        editable: !sw.fixed,
        type: "WAGE",
        note: sw.name.name,
      });
    });

    // DEDUCTIONS
    user.deductions.forEach((deduction) => {
      transactionItemsData.push({
        amount: deduction.amount,
        editable: !deduction.fixed,
        type: "DEDUCTION",
        note: deduction.name.name,
      });
    });

    const total = transactionItemsData.reduce((acc, curr) => {
      if (curr.type === "WAGE") {
        return acc + curr.amount;
      }
      return acc - curr.amount;
    }, 0);

    return {
      id: user.id,
      totalWorkingHours,
      transactionItemsData,
      total,
    };
  });

  const result = await prisma.$transaction(
    usersData.map((userData) =>
      prisma.payrollTransaction.create({
        data: {
          total: userData.total,
          payrollId,
          userId: userData.id,
          transactionItems: {
            createMany: { data: userData.transactionItemsData },
          },
        },
      })
    )
  );

  return result;
}

export async function getPayrollTransactionById({ id }: { id: string }) {
  const payrollTransactions = await prisma.payrollTransaction.findUnique({
    where: { id },
    include: {
      payroll: true,
      user: { select: { id: true, name: true, photo: true } },
      transactionItems: true,
    },
  });

  return payrollTransactions;
}
