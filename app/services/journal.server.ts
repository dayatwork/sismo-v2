import { type Prisma } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function getJournals({
  organizationId,
}: {
  organizationId: string;
}) {
  const journals = await prisma.journal.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
    include: {
      chartOfAccount: true,
      createdBy: { select: { id: true, name: true, photo: true } },
    },
  });
  return journals;
}

export async function getJournalById({
  organizationId,
  journalId,
}: {
  organizationId: string;
  journalId: string;
}) {
  const journal = await prisma.journal.findUnique({
    where: { organizationId, id: journalId },
    include: {
      chartOfAccount: true,
      createdBy: { select: { id: true, name: true, photo: true } },
    },
  });
  return journal;
}

export async function createJournal({
  amount,
  chartOfAccountId,
  createdById,
  currency,
  organizationId,
  referenceNumber,
  date,
  description,
}: {
  organizationId: string;
  referenceNumber: string;
  chartOfAccountId: string;
  amount: Prisma.Decimal;
  currency: "IDR" | "USD";
  createdById: string;
  description?: string;
  date?: string;
}) {
  const journal = await prisma.journal.create({
    data: {
      organizationId,
      amount,
      chartOfAccountId,
      createdById,
      currency,
      referenceNumber,
      date,
      description,
    },
  });
  return journal;
}

export async function deleteJournal({
  organizationId,
  journalId,
}: {
  journalId: string;
  organizationId: string;
}) {
  const journal = await prisma.journal.delete({
    where: { id: journalId, organizationId },
  });
  return journal;
}
