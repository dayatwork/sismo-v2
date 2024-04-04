import { type RegularWageType } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function getUsersWages() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      photo: true,
      regularWage: true,
      regularWageHistories: true,
      overtimeWage: true,
      supplementalWages: { include: { name: true } },
    },
  });
  return users;
}

export async function getRegularWages() {
  const wages = await prisma.regularWage.findMany({
    include: { user: { select: { id: true, name: true, photo: true } } },
  });
  return wages;
}

export async function setRegularWage({
  amount,
  type,
  userId,
  normalWorkingHours,
}: {
  amount: number;
  type: RegularWageType;
  userId: string;
  normalWorkingHours: number;
}) {
  return await prisma.$transaction([
    prisma.regularWage.upsert({
      create: { userId, amount, type, normalWorkingHours },
      update: { amount, type },
      where: { userId },
    }),
    prisma.regularWageHistory.create({ data: { amount, type, userId } }),
  ]);
}

export async function getOvertimeWages() {
  const wages = await prisma.overtimeWage.findMany({
    include: { user: { select: { id: true, name: true, photo: true } } },
  });
  return wages;
}

export async function setOvertimeWage({
  amount,
  userId,
  maxOvertime,
}: {
  amount: number;
  userId: string;
  maxOvertime?: number;
}) {
  const overtime = prisma.overtimeWage.upsert({
    create: { userId, amount, maxOvertime },
    update: { amount, maxOvertime },
    where: { userId },
  });
  return overtime;
}

export async function getSuplementalWages() {
  const wages = await prisma.supplementalWage.findMany({
    include: {
      name: true,
      user: { select: { id: true, name: true, photo: true } },
    },
  });
  return wages;
}

export async function getSuplementalWageNames() {
  const names = await prisma.supplementalWageName.findMany();
  return names;
}

export async function createSuplementalWage({
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
  const wage = await prisma.supplementalWage.create({
    data: { amount, fixed, nameId, userId },
  });
  return wage;
}
