import prisma from "~/lib/prisma";

export async function getChartOfAccounts() {
  const chartOfAccounts = await prisma.chartOfAccount.findMany({
    orderBy: { createdAt: "asc" },
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
  normalBalance,
  description,
}: {
  typeId: string;
  code: string;
  accountName: string;
  normalBalance: "CREDIT" | "DEBIT";
  description?: string;
}) {
  const chartOfAccount = await prisma.chartOfAccount.create({
    data: {
      code,
      accountName,
      normalBalance,
      typeId,
      description,
    },
  });
  return chartOfAccount;
}

export async function editChartOfAccount({
  chartOfAccountId,
  accountName,
  code,
  description,
  normalBalance,
  typeId,
}: {
  chartOfAccountId: string;
  typeId?: string;
  code?: string;
  accountName?: string;
  normalBalance?: "CREDIT" | "DEBIT";
  description?: string;
}) {
  const chartOfAccount = await prisma.chartOfAccount.update({
    where: { id: chartOfAccountId },
    data: {
      code,
      accountName,
      description,
      normalBalance,
      typeId,
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

export async function createCoaClass({ name }: { name: string }) {
  const coaClass = await prisma.chartOfAccountClass.create({
    data: {
      name,
    },
  });
  return coaClass;
}

export async function editCoaClass({
  classId,
  name,
}: {
  classId: string;
  name: string;
}) {
  const coaClass = await prisma.chartOfAccountClass.update({
    where: { id: classId },
    data: {
      name,
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
