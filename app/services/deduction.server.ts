import prisma from "~/lib/prisma";

export async function getUsersDeductions() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      photo: true,
      deductions: { include: { name: true } },
    },
  });
  return users;
}

export async function getDeductions() {
  const deductions = await prisma.deduction.findMany({
    include: {
      user: { select: { id: true, name: true, photo: true } },
      name: true,
    },
  });
  return deductions;
}

export async function createDeduction({
  amount,
  fixed,
  nameId,
  userId,
}: {
  userId: string;
  nameId: string;
  amount: number;
  fixed: boolean;
}) {
  const deduction = await prisma.deduction.create({
    data: { amount, nameId, fixed, userId },
  });
  return deduction;
}

export async function getDeductionNames() {
  const names = await prisma.deductionName.findMany();
  return names;
}
