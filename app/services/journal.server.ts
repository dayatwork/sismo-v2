import { type Prisma } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function getJournals() {
  const journals = await prisma.journal.findMany({
    orderBy: { date: "desc" },
    include: {
      chartOfAccount: true,
      createdBy: { select: { id: true, name: true, photo: true } },
    },
  });
  return journals;
}

export async function getJournalById({ journalId }: { journalId: string }) {
  const journal = await prisma.journal.findUnique({
    where: { id: journalId },
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
  referenceNumber,
  date,
  description,
}: {
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

export async function deleteJournal({ journalId }: { journalId: string }) {
  const journal = await prisma.journal.delete({
    where: { id: journalId },
  });
  return journal;
}
