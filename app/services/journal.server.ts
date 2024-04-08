import { type Prisma } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function getJournalEntries() {
  const journals = await prisma.journalEntry.findMany({
    orderBy: { date: "desc" },
    include: {
      entryLines: { include: { account: true } },
      createdBy: { select: { id: true, name: true, photo: true } },
    },
  });
  return journals;
}

export async function getJournalEntryById({ id }: { id: string }) {
  const journal = await prisma.journalEntry.findUnique({
    where: { id },
    include: {
      entryLines: { include: { account: true } },
      createdBy: { select: { id: true, name: true, photo: true } },
    },
  });
  return journal;
}

export async function createJournalEntry({
  createdById,
  referenceNumber,
  date,
  description,
  entryLines,
}: {
  referenceNumber?: string;
  createdById?: string;
  description?: string;
  date?: string | Date;
  entryLines: {
    type: "CREDIT" | "DEBIT";
    accountId: string;
    amount: Prisma.Decimal;
    currency?: "IDR" | "USD";
  }[];
}) {
  const totalDebit = entryLines.reduce((acc, curr) => {
    if (curr.type === "DEBIT") {
      return acc + curr.amount.toNumber();
    }
    return acc;
  }, 0);

  const totalCredit = entryLines.reduce((acc, curr) => {
    if (curr.type === "CREDIT") {
      return acc + curr.amount.toNumber();
    }
    return acc;
  }, 0);

  if (totalCredit !== totalDebit) {
    throw new Error("Credit and Debit should match");
  }

  const journal = await prisma.journalEntry.create({
    data: {
      referenceNumber,
      createdById,
      description,
      date,
      entryLines: { createMany: { data: entryLines } },
    },
  });

  return journal;
}

export async function editJournalEntry({
  id,
  date,
  description,
  entryLines,
  referenceNumber,
}: {
  id: string;
  referenceNumber?: string;
  description?: string;
  date?: string | Date;
  entryLines?: {
    type: "CREDIT" | "DEBIT";
    accountId: string;
    amount: Prisma.Decimal;
    currency?: "IDR" | "USD";
  }[];
}) {
  const result = await prisma.$transaction(async (tx) => {
    if (entryLines) {
      const totalDebit = entryLines.reduce((acc, curr) => {
        if (curr.type === "DEBIT") {
          return acc + curr.amount.toNumber();
        }
        return acc;
      }, 0);

      const totalCredit = entryLines.reduce((acc, curr) => {
        if (curr.type === "CREDIT") {
          return acc + curr.amount.toNumber();
        }
        return acc;
      }, 0);

      if (totalCredit !== totalDebit) {
        throw new Error("Credit and Debit should match");
      }

      await tx.journalEntryLine.deleteMany({ where: { journalEntryId: id } });
      await tx.journalEntryLine.createMany({
        data: entryLines.map((line) => ({ journalEntryId: id, ...line })),
      });
    }

    const journal = await tx.journalEntry.update({
      where: { id },
      data: {
        description,
        date,
        referenceNumber,
      },
    });

    return journal;
  });

  return result;
}

export async function deleteJournalEntry({ id }: { id: string }) {
  const journal = await prisma.journalEntry.delete({
    where: { id },
  });
  return journal;
}
