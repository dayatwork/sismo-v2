import prisma from "~/lib/prisma";

export async function getChartOfAccounts() {
  const chartOfAccounts = await prisma.chartOfAccount.findMany({
    orderBy: { code: "asc" },
    include: { type: { include: { category: true } } },
  });
  return chartOfAccounts;
}

export async function getChartOfAccountById({
  chartOfAccountId,
}: {
  chartOfAccountId: string;
}) {
  const chartOfAccount = await prisma.chartOfAccount.findUnique({
    where: { id: chartOfAccountId },
    include: { type: { include: { category: true } } },
  });
  return chartOfAccount;
}

export async function createChartOfAccount({
  typeId,
  code,
  accountName,
  // normalBalance,
  description,
  openingBalance,
}: {
  typeId: string;
  code: string;
  accountName: string;
  // normalBalance: "CREDIT" | "DEBIT";
  description?: string;
  openingBalance: number;
}) {
  const type = await prisma.chartOfAccountType.findUnique({
    where: { id: typeId },
    include: { category: true },
  });
  if (!type) {
    throw new Error(`Type with id ${typeId} not found`);
  }

  const chartOfAccount = await prisma.chartOfAccount.create({
    data: {
      code,
      accountName,
      normalBalance: type?.category.normalBalance,
      typeId,
      description,
      openingBalance,
    },
  });
  return chartOfAccount;
}

export async function editChartOfAccount({
  chartOfAccountId,
  accountName,
  code,
  description,
  // normalBalance,
  typeId,
  openingBalance,
}: {
  chartOfAccountId: string;
  typeId?: string;
  code?: string;
  accountName?: string;
  // normalBalance?: "CREDIT" | "DEBIT";
  description?: string;
  openingBalance?: number;
}) {
  let normalBalance: "CREDIT" | "DEBIT" | undefined;

  if (typeId) {
    const type = await prisma.chartOfAccountType.findUnique({
      where: { id: typeId },
      include: { category: true },
    });
    if (!type) {
      throw new Error(`Type with id ${typeId} not found`);
    }
    normalBalance = type.category.normalBalance;
  }

  const chartOfAccount = await prisma.chartOfAccount.update({
    where: { id: chartOfAccountId },
    data: {
      code,
      accountName,
      description,
      normalBalance,
      typeId,
      openingBalance,
    },
  });
  return chartOfAccount;
}

export async function deleteChartOfAccount({
  chartOfAccountId,
}: {
  chartOfAccountId: string;
}) {
  const chartOfAccount = await prisma.chartOfAccount.delete({
    where: { id: chartOfAccountId },
  });
  return chartOfAccount;
}

export async function getCoaCategories() {
  const coaCategories = await prisma.chartOfAccountCategory.findMany({
    orderBy: { createdAt: "asc" },
  });
  return coaCategories;
}

export async function getCoaCategoryById({
  categoryId,
}: {
  categoryId: string;
}) {
  const coaCategory = await prisma.chartOfAccountCategory.findUnique({
    where: { id: categoryId },
  });
  return coaCategory;
}

export async function createCoaCategory({
  name,
  normalBalance,
}: {
  name: string;
  normalBalance: "DEBIT" | "CREDIT";
}) {
  const coaCategory = await prisma.chartOfAccountCategory.create({
    data: {
      name,
      normalBalance,
    },
  });
  return coaCategory;
}

export async function editCoaCategory({
  categoryId,
  name,
  normalBalance,
}: {
  categoryId: string;
  name: string;
  normalBalance: "CREDIT" | "DEBIT";
}) {
  const coaCategory = await prisma.chartOfAccountCategory.update({
    where: { id: categoryId },
    data: {
      name,
      normalBalance,
    },
  });
  return coaCategory;
}

export async function deleteCoaCategory({
  categoryId,
}: {
  categoryId: string;
}) {
  const coaCategory = await prisma.chartOfAccountCategory.delete({
    where: { id: categoryId },
  });
  return coaCategory;
}

type GetCoaTypesProps = { categoryId?: string };

export async function getCoaTypes(props?: GetCoaTypesProps) {
  const coaTypes = await prisma.chartOfAccountType.findMany({
    where: { categoryId: props?.categoryId },
    orderBy: { createdAt: "asc" },
    include: { category: true },
  });
  return coaTypes;
}

export async function getCoaTypeById({ typeId }: { typeId: string }) {
  const coaType = await prisma.chartOfAccountType.findUnique({
    where: { id: typeId },
    include: { category: true },
  });
  return coaType;
}

export async function createCoaType({
  name,
  categoryId,
}: {
  name: string;
  categoryId: string;
}) {
  const coaType = await prisma.chartOfAccountType.create({
    data: {
      categoryId,
      name,
    },
  });
  return coaType;
}

export async function editCoaType({
  typeId,
  name,
  categoryId,
}: {
  typeId: string;
  name?: string;
  categoryId?: string;
}) {
  const coaType = await prisma.chartOfAccountType.update({
    where: { id: typeId },
    data: {
      name,
      categoryId,
    },
  });
  return coaType;
}

export async function deleteCoaType({ typeId }: { typeId: string }) {
  const coaType = await prisma.chartOfAccountType.delete({
    where: { id: typeId },
  });
  return coaType;
}

export async function getAccountWithTransactions({
  accountId,
}: {
  accountId: string;
}) {
  const account = await prisma.chartOfAccount.findUnique({
    where: { id: accountId },
    include: {
      type: { include: { category: true } },
      journalEntryLines: {
        include: {
          journalEntry: {
            select: {
              id: true,
              date: true,
              description: true,
              entryNumber: true,
            },
          },
        },
      },
    },
  });
  return account;
}

type GetFinanceDashboardDataProps = {
  endPeriod?: string | Date;
};
export async function getFinanceDashboardData(
  props?: GetFinanceDashboardDataProps
) {
  const accounts = await prisma.chartOfAccount.findMany({
    include: {
      journalEntryLines: {
        where: props?.endPeriod
          ? { journalEntry: { date: { lte: props.endPeriod } } }
          : undefined,
      },
      type: { include: { category: true } },
    },
  });

  const trialBalance = accounts.map((account) => {
    const totalBalance =
      account.journalEntryLines.reduce((acc, curr) => {
        if (
          (account.normalBalance === "DEBIT" && curr.type === "DEBIT") ||
          (account.normalBalance === "CREDIT" && curr.type === "CREDIT")
        ) {
          return acc + Number(curr.amount);
        }
        return acc - Number(curr.amount);
      }, 0) + account.openingBalance;

    return {
      accountId: account.id,
      accountName: account.accountName,
      accountCategory: account.type.category.name,
      normalBalance: account.normalBalance,
      totalBalance,
      openingBalance: account.openingBalance,
    };
  });

  let dashboardData: Record<string, typeof trialBalance> = {};

  trialBalance.forEach((trialBalance) => {
    if (dashboardData[trialBalance.accountCategory]) {
      dashboardData[trialBalance.accountCategory].push(trialBalance);
    } else {
      dashboardData[trialBalance.accountCategory] = [trialBalance];
    }
  });

  return dashboardData;
}

type GetTrialBalanceProps = {
  endPeriod?: string | Date;
};
export async function getTrialBalance(props?: GetTrialBalanceProps) {
  const accounts = await prisma.chartOfAccount.findMany({
    include: {
      journalEntryLines: {
        where: props?.endPeriod
          ? { journalEntry: { date: { lte: props.endPeriod } } }
          : undefined,
      },
      type: { include: { category: true } },
    },
  });

  const trialBalance = accounts.map((account) => {
    const totalBalance =
      account.journalEntryLines.reduce((acc, curr) => {
        if (
          (account.normalBalance === "DEBIT" && curr.type === "DEBIT") ||
          (account.normalBalance === "CREDIT" && curr.type === "CREDIT")
        ) {
          return acc + Number(curr.amount);
        }
        return acc - Number(curr.amount);
      }, 0) + account.openingBalance;

    return {
      accountId: account.id,
      accountName: account.accountName,
      accountCategory: account.type.category.name,
      normalBalance: account.normalBalance,
      totalBalance,
    };
  });

  return trialBalance;
}
