import prisma from "~/lib/prisma";

export async function getDirectorates(organizationId: string) {
  const directorates = await prisma.directorate.findMany({
    where: { organizationId },
    include: { divisions: true },
  });
  return directorates;
}

export async function createDirectorate({
  name,
  organizationId,
}: {
  name: string;
  organizationId: string;
}) {
  const directorate = await prisma.directorate.create({
    data: { name, organizationId },
  });
  return directorate;
}

export async function getDirectorateById({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  const directorate = await prisma.directorate.findUnique({
    where: { id, organizationId },
  });
  return directorate;
}

export async function editDirectorate({
  id,
  name,
  organizationId,
}: {
  id: string;
  name: string;
  organizationId: string;
}) {
  const directorate = await prisma.directorate.update({
    where: { id, organizationId },
    data: { name },
  });
  return directorate;
}

export async function deleteDirectorate({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  const directorate = await prisma.directorate.delete({
    where: { id, organizationId },
  });
  return directorate;
}
