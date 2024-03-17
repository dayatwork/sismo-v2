import prisma from "~/lib/prisma";

export async function getJobLevels(organizationId: string) {
  const jobLevels = await prisma.jobLevel.findMany({
    where: { organizationId },
  });
  return jobLevels;
}

export async function getJobLevelById({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  const jobLevel = await prisma.jobLevel.findUnique({
    where: { organizationId, id },
  });
  return jobLevel;
}

export async function createJobLevel({
  name,
  organizationId,
}: {
  name: string;
  organizationId: string;
}) {
  const jobLevel = await prisma.jobLevel.create({
    data: { name, organizationId },
  });
  return jobLevel;
}

export async function editJobLevel({
  id,
  name,
  organizationId,
}: {
  id: string;
  name: string;
  organizationId: string;
}) {
  const jobLevel = await prisma.jobLevel.update({
    where: { id, organizationId },
    data: { name },
  });
  return jobLevel;
}

export async function deleteJobLevel({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  return await prisma.jobLevel.delete({ where: { id, organizationId } });
}
