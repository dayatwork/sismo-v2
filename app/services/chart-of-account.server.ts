import prisma from "~/lib/prisma";

export async function getChartOfAccounts() {
  const chartOfAccounts = await prisma.chartOfAccount.findMany({
    orderBy: { code: "asc" },
    include: { type: { include: { class: true } } },
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
    include: { type: { include: { class: true } } },
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
    include: { class: true },
  });
  if (!type) {
    throw new Error(`Type with id ${typeId} not found`);
  }

  const chartOfAccount = await prisma.chartOfAccount.create({
    data: {
      code,
      accountName,
      normalBalance: type?.class.normalBalance,
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
      include: { class: true },
    });
    if (!type) {
      throw new Error(`Type with id ${typeId} not found`);
    }
    normalBalance = type.class.normalBalance;
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

export async function getCoaClasses() {
  const coaClasses = await prisma.chartOfAccountClass.findMany({
    orderBy: { createdAt: "asc" },
  });
  return coaClasses;
}

export async function getCoaClassById({ classId }: { classId: string }) {
  const coaClass = await prisma.chartOfAccountClass.findUnique({
    where: { id: classId },
  });
  return coaClass;
}

export async function createCoaClass({
  name,
  normalBalance,
}: {
  name: string;
  normalBalance: "DEBIT" | "CREDIT";
}) {
  const coaClass = await prisma.chartOfAccountClass.create({
    data: {
      name,
      normalBalance,
    },
  });
  return coaClass;
}

export async function editCoaClass({
  classId,
  name,
  normalBalance,
}: {
  classId: string;
  name: string;
  normalBalance: "CREDIT" | "DEBIT";
}) {
  const coaClass = await prisma.chartOfAccountClass.update({
    where: { id: classId },
    data: {
      name,
      normalBalance,
    },
  });
  return coaClass;
}

export async function deleteCoaClass({ classId }: { classId: string }) {
  const coaClass = await prisma.chartOfAccountClass.delete({
    where: { id: classId },
  });
  return coaClass;
}

type GetCoaTypesProps = { classId?: string };

export async function getCoaTypes(props?: GetCoaTypesProps) {
  const coaTypes = await prisma.chartOfAccountType.findMany({
    where: { classId: props?.classId },
    orderBy: { createdAt: "asc" },
    include: { class: true },
  });
  return coaTypes;
}

export async function getCoaTypeById({ typeId }: { typeId: string }) {
  const coaType = await prisma.chartOfAccountType.findUnique({
    where: { id: typeId },
    include: { class: true },
  });
  return coaType;
}

export async function createCoaType({
  name,
  classId,
}: {
  name: string;
  classId: string;
}) {
  const coaType = await prisma.chartOfAccountType.create({
    data: {
      classId,
      name,
    },
  });
  return coaType;
}

export async function editCoaType({
  typeId,
  name,
  classId,
}: {
  typeId: string;
  name?: string;
  classId?: string;
}) {
  const coaType = await prisma.chartOfAccountType.update({
    where: { id: typeId },
    data: {
      name,
      classId,
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
