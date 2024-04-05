import {
  type TransactionItemType,
  type PayrollType,
  type PrismaClient,
  type Prisma,
} from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";

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

export async function createNewPayrollTransactionItem({
  transactionId,
  note,
  amount,
  type,
}: {
  transactionId: string;
  note?: string;
  type: TransactionItemType;
  amount: number;
}) {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.payrollTransaction.findUniqueOrThrow({
      where: { id: transactionId },
    });
    if (transaction.isLocked) {
      throw new Error("Payroll transaction are locked!");
    }
    const transactionItem = await tx.payrollTransactionItem.create({
      data: { transactionId, editable: true, note, amount, type },
    });

    await recalculateTotalPayrollTransaction({
      transactionId: transactionItem.transactionId,
      tx,
    });

    return transactionItem;
  });
}

export async function editPayrollTransactionItem({
  id,
  note,
  amount,
  transactionId,
}: {
  id: string;
  transactionId: string;
  note?: string;
  amount?: number;
}) {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.payrollTransaction.findUniqueOrThrow({
      where: { id: transactionId },
    });

    if (transaction.isLocked) {
      throw new Error("Payroll transaction are locked!");
    }
    const transactionItem = await tx.payrollTransactionItem.update({
      where: { id },
      data: { note, amount },
    });

    await recalculateTotalPayrollTransaction({
      transactionId: transactionItem.transactionId,
      tx,
    });

    return transactionItem;
  });
}

export async function deletePayrollTransactionItem({
  id,
  transactionId,
}: {
  id: string;
  transactionId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.payrollTransaction.findUniqueOrThrow({
      where: { id: transactionId },
    });

    if (transaction.isLocked) {
      throw new Error("Payroll transaction are locked!");
    }

    const transactionItem = await tx.payrollTransactionItem.delete({
      where: { id },
    });

    await recalculateTotalPayrollTransaction({
      transactionId: transactionItem.transactionId,
      tx,
    });

    return transactionItem;
  });
}

export async function recalculateTotalPayrollTransaction({
  transactionId,
  tx,
}: {
  transactionId: string;
  tx: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;
}) {
  const transaction = await tx.payrollTransaction.findUniqueOrThrow({
    where: { id: transactionId },
    include: { transactionItems: true },
  });

  const newTotal = transaction.transactionItems.reduce((acc, curr) => {
    if (curr.type === "WAGE") {
      return acc + curr.amount;
    }
    return acc - curr.amount;
  }, 0);

  return await tx.payrollTransaction.update({
    where: { id: transactionId },
    data: { total: newTotal },
  });
}

export async function resetPayrollTransaction({
  transactionId,
  payrollId,
}: {
  transactionId: string;
  payrollId: string;
}) {
  const payroll = await prisma.payroll.findUniqueOrThrow({
    where: { id: payrollId },
  });
  if (payroll.locked) {
    throw new Error("Payroll are locked!");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.payrollTransactionItem.deleteMany({
      where: { transactionId },
    });

    const transaction = await tx.payrollTransaction.findUniqueOrThrow({
      where: { id: transactionId },
      include: {
        user: {
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
        },
      },
    });

    const totalWorkingHours = transaction.user.taskTrackers.reduce(
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

    if (transaction.user.regularWage) {
      if (transaction.user.regularWage.type === "HOURLY") {
        transactionItemsData.push({
          amount: totalWorkingHours * transaction.user.regularWage.amount,
          editable: false,
          type: "WAGE",
          note: "Regular wage",
        });
      } else {
        transactionItemsData.push({
          amount: transaction.user.regularWage.amount,
          editable: false,
          type: "WAGE",
          note: "Regular wage",
        });
      }
    }

    // TODO: OVERTIME WAGE

    // SUPPLEMENTAL WAGES
    transaction.user.supplementalWages.forEach((sw) => {
      transactionItemsData.push({
        amount: sw.amount,
        editable: !sw.fixed,
        type: "WAGE",
        note: sw.name.name,
      });
    });

    // DEDUCTIONS
    transaction.user.deductions.forEach((deduction) => {
      transactionItemsData.push({
        amount: deduction.amount,
        editable: !deduction.fixed,
        type: "DEDUCTION",
        note: deduction.name.name,
      });
    });

    const data = transactionItemsData.map((itemData) => ({
      transactionId,
      ...itemData,
    }));

    const result = await tx.payrollTransactionItem.createMany({
      data,
    });

    await recalculateTotalPayrollTransaction({ transactionId, tx });

    return result;
  });
}

export async function lockPayrollTransaction({
  transactionId,
}: {
  transactionId: string;
}) {
  const transaction = await prisma.payrollTransaction.update({
    where: { id: transactionId },
    data: { isLocked: true },
  });
  return transaction;
}

export async function lockPayroll({ payrollId }: { payrollId: string }) {
  return await prisma.$transaction(async (tx) => {
    const unlockTransaction = await tx.payrollTransaction.findFirst({
      where: { payrollId, isLocked: false },
    });
    if (unlockTransaction) {
      throw new Error(
        "You should lock all transaction before locking payroll!"
      );
    }

    const payroll = await tx.payroll.update({
      where: { id: payrollId },
      data: { locked: true },
    });

    return payroll;
  });
}
