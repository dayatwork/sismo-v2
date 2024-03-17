import prisma from "~/lib/prisma";

export async function createDivision({
  directorateId,
  organizationId,
  name,
}: {
  organizationId: string;
  directorateId: string;
  name: string;
}) {
  const division = await prisma.division.create({
    data: { name, directorateId, organizationId },
  });
  return division;
}

export async function getDivisionById({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  const division = await prisma.division.findUnique({
    where: { id, organizationId },
  });
  return division;
}

export async function editDivision({
  id,
  name,
  organizationId,
}: {
  id: string;
  name: string;
  organizationId: string;
}) {
  const division = await prisma.division.update({
    where: { id, organizationId },
    data: { name },
  });
  return division;
}

export async function deleteDivision({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  const division = await prisma.division.delete({
    where: { id, organizationId },
  });
  return division;
}
