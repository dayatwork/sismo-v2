import prisma from "~/lib/prisma";

export async function getMilestones({ stageId }: { stageId: string }) {
  const milestones = await prisma.milestone.findMany({
    where: { stageId },
    include: { tasks: { select: { id: true, status: true, name: true } } },
  });
  return milestones;
}

export async function getMilestoneById({ id }: { id: string }) {
  const milestones = await prisma.milestone.findUnique({
    where: { id },
  });
  return milestones;
}

export async function createMilestone({
  name,
  stageId,
  description,
  weight,
}: {
  stageId: string;
  name: string;
  description?: string;
  weight?: number;
}) {
  const milestone = await prisma.milestone.create({
    data: { name, stageId, description, weight },
  });
  return milestone;
}

export async function editMilestone({
  id,
  name,
  description,
  weight,
}: {
  id: string;
  name: string;
  description?: string;
  weight?: number;
}) {
  const milestone = await prisma.milestone.update({
    where: { id },
    data: { name, description, weight },
  });
  return milestone;
}

export async function deleteMilestone({
  milestoneId,
}: {
  milestoneId: string;
}) {
  const milestone = await prisma.milestone.delete({
    where: { id: milestoneId },
  });
  return milestone;
}
