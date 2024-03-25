import prisma from "~/lib/prisma";

export async function createDivision({
  directorateId,
  name,
}: {
  directorateId: string;
  name: string;
}) {
  const division = await prisma.division.create({
    data: { name, directorateId },
  });
  return division;
}

export async function getDivisionById({ id }: { id: string }) {
  const division = await prisma.division.findUnique({
    where: { id },
  });
  return division;
}

export async function editDivision({ id, name }: { id: string; name: string }) {
  const division = await prisma.division.update({
    where: { id },
    data: { name },
  });
  return division;
}

export async function deleteDivision({ id }: { id: string }) {
  const division = await prisma.division.delete({
    where: { id },
  });
  return division;
}
