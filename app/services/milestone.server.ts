import prisma from "~/lib/prisma";

export async function getMilestones({
  organizationId,
  stageId,
}: {
  organizationId: string;
  stageId: string;
}) {
  const milestones = await prisma.milestone.findMany({
    where: { organizationId, stageId },
    include: { tasks: { select: { id: true, status: true, name: true } } },
  });
  return milestones;
}

export async function getMilestoneById({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  const milestones = await prisma.milestone.findUnique({
    where: { organizationId, id },
  });
  return milestones;
}

export async function createMilestone({
  name,
  organizationId,
  stageId,
  description,
  weight,
}: {
  organizationId: string;
  stageId: string;
  name: string;
  description?: string;
  weight?: number;
}) {
  const milestone = await prisma.milestone.create({
    data: { name, organizationId, stageId, description, weight },
  });
  return milestone;
}

export async function editMilestone({
  id,
  organizationId,
  name,
  description,
  weight,
}: {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  weight?: number;
}) {
  const milestone = await prisma.milestone.update({
    where: { id, organizationId },
    data: { name, description, weight },
  });
  return milestone;
}

export async function deleteMilestone({
  milestoneId,
  organizationId,
}: {
  milestoneId: string;
  organizationId: string;
}) {
  const milestone = await prisma.milestone.delete({
    where: { id: milestoneId, organizationId },
  });
  return milestone;
}
