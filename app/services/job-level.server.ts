import prisma from "~/lib/prisma";

export async function getJobLevels() {
  const jobLevels = await prisma.jobLevel.findMany();
  return jobLevels;
}

export async function getJobLevelById({ id }: { id: string }) {
  const jobLevel = await prisma.jobLevel.findUnique({
    where: { id },
  });
  return jobLevel;
}

export async function createJobLevel({ name }: { name: string }) {
  const jobLevel = await prisma.jobLevel.create({
    data: { name },
  });
  return jobLevel;
}

export async function editJobLevel({ id, name }: { id: string; name: string }) {
  const jobLevel = await prisma.jobLevel.update({
    where: { id },
    data: { name },
  });
  return jobLevel;
}

export async function deleteJobLevel({ id }: { id: string }) {
  return await prisma.jobLevel.delete({ where: { id } });
}
