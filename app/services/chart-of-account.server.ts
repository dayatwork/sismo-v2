import prisma from "~/lib/prisma";

export async function getChartOfAccounts({
  organizationId,
}: {
  organizationId: string;
}) {
  const chartOfAccounts = await prisma.chartOfAccount.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
    include: { type: { include: { class: true } } },
  });
  return chartOfAccounts;
}

export async function getChartOfAccountById({
  organizationId,
  chartOfAccountId,
}: {
  organizationId: string;
  chartOfAccountId: string;
}) {
  const chartOfAccount = await prisma.chartOfAccount.findUnique({
    where: { organizationId, id: chartOfAccountId },
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
  organizationId,
}: {
  typeId: string;
  code: string;
  accountName: string;
  normalBalance: "CREDIT" | "DEBIT";
  description?: string;
  organizationId: string;
}) {
  const chartOfAccount = await prisma.chartOfAccount.create({
    data: {
      code,
      accountName,
      normalBalance,
      typeId,
      description,
      organizationId,
    },
  });
  return chartOfAccount;
}

export async function editChartOfAccount({
  chartOfAccountId,
  organizationId,
  accountName,
  code,
  description,
  normalBalance,
  typeId,
}: {
  organizationId: string;
  chartOfAccountId: string;
  typeId?: string;
  code?: string;
  accountName?: string;
  normalBalance?: "CREDIT" | "DEBIT";
  description?: string;
}) {
  const chartOfAccount = await prisma.chartOfAccount.update({
    where: { id: chartOfAccountId, organizationId },
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
  organizationId,
  chartOfAccountId,
}: {
  chartOfAccountId: string;
  organizationId: string;
}) {
  const chartOfAccount = await prisma.chartOfAccount.delete({
    where: { id: chartOfAccountId, organizationId },
  });
  return chartOfAccount;
}

export async function getCoaClasses({
  organizationId,
}: {
  organizationId: string;
}) {
  const coaClasses = await prisma.chartOfAccountClass.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
  return coaClasses;
}

export async function getCoaClassById({
  organizationId,
  classId,
}: {
  organizationId: string;
  classId: string;
}) {
  const coaClass = await prisma.chartOfAccountClass.findUnique({
    where: { organizationId, id: classId },
  });
  return coaClass;
}

export async function createCoaClass({
  name,
  organizationId,
}: {
  name: string;
  organizationId: string;
}) {
  const coaClass = await prisma.chartOfAccountClass.create({
    data: {
      name,
      organizationId,
    },
  });
  return coaClass;
}

export async function editCoaClass({
  organizationId,
  classId,
  name,
}: {
  organizationId: string;
  classId: string;
  name: string;
}) {
  const coaClass = await prisma.chartOfAccountClass.update({
    where: { id: classId, organizationId },
    data: {
      name,
    },
  });
  return coaClass;
}

export async function deleteCoaClass({
  organizationId,
  classId,
}: {
  classId: string;
  organizationId: string;
}) {
  const coaClass = await prisma.chartOfAccountClass.delete({
    where: { id: classId, organizationId },
  });
  return coaClass;
}

export async function getCoaTypes({
  organizationId,
  classId,
}: {
  organizationId: string;
  classId?: string;
}) {
  const coaTypes = await prisma.chartOfAccountType.findMany({
    where: { organizationId, classId },
    orderBy: { createdAt: "asc" },
    include: { class: true },
  });
  return coaTypes;
}

export async function getCoaTypeById({
  organizationId,
  typeId,
}: {
  organizationId: string;
  typeId: string;
}) {
  const coaType = await prisma.chartOfAccountType.findUnique({
    where: { organizationId, id: typeId },
    include: { class: true },
  });
  return coaType;
}

export async function createCoaType({
  name,
  organizationId,
  classId,
}: {
  name: string;
  organizationId: string;
  classId: string;
}) {
  const coaType = await prisma.chartOfAccountType.create({
    data: {
      classId,
      name,
      organizationId,
    },
  });
  return coaType;
}

export async function editCoaType({
  organizationId,
  typeId,
  name,
  classId,
}: {
  organizationId: string;
  typeId: string;
  name?: string;
  classId?: string;
}) {
  const coaType = await prisma.chartOfAccountType.update({
    where: { id: typeId, organizationId },
    data: {
      name,
      classId,
    },
  });
  return coaType;
}

export async function deleteCoaType({
  organizationId,
  typeId,
}: {
  typeId: string;
  organizationId: string;
}) {
  const coaType = await prisma.chartOfAccountType.delete({
    where: { id: typeId, organizationId },
  });
  return coaType;
}
