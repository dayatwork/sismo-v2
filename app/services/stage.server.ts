import prisma from "~/lib/prisma";

export async function getStages({
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId: string;
}) {
  const stages = await prisma.stage.findMany({
    where: { organizationId, projectId },
    include: {
      milestones: { include: { tasks: true } },
      members: { include: { user: true } },
      project: { select: { id: true, name: true, status: true } },
    },
  });
  return stages;
}

export async function getUserStages({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  const stages = await prisma.stage.findMany({
    where: { organizationId, members: { some: { userId } } },
    select: {
      id: true,
      name: true,
      project: { select: { id: true, name: true, status: true } },
    },
  });
  return stages;
}

export async function getStageById({
  id,
  organizationId,
}: {
  organizationId: string;
  id: string;
}) {
  const stage = await prisma.stage.findUnique({
    where: { id, organizationId },
    include: { project: true, members: { include: { user: true } } },
  });
  return stage;
}

export async function createStage({
  description,
  name,
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId: string;
  name: string;
  description: string;
}) {
  const stagesCount = await prisma.stage.count({
    where: { organizationId, projectId },
  });

  const stage = await prisma.stage.create({
    data: {
      organizationId,
      name,
      description,
      projectId,
      stageOrder: stagesCount + 1,
    },
  });

  return stage;
}

export async function startStage({
  organizationId,
  stageId,
}: {
  stageId: string;
  organizationId: string;
}) {
  const stage = await prisma.stage.update({
    where: { id: stageId, organizationId },
    data: { status: "ONGOING" },
  });
  return stage;
}

export async function holdStage({
  organizationId,
  stageId,
}: {
  stageId: string;
  organizationId: string;
}) {
  const stage = await prisma.stage.update({
    where: { id: stageId, organizationId },
    data: { status: "ONHOLD" },
  });
  return stage;
}

export async function completeStage({
  organizationId,
  stageId,
}: {
  stageId: string;
  organizationId: string;
}) {
  const stage = await prisma.stage.update({
    where: { id: stageId, organizationId },
    data: { status: "COMPLETED" },
  });
  return stage;
}

export async function removeStageMember({ memberId }: { memberId: string }) {
  const stageMember = await prisma.stageMember.delete({
    where: { id: memberId },
  });
  return stageMember;
}

export async function getStageMembers({ stageId }: { stageId: string }) {
  const stageMembers = await prisma.stageMember.findMany({
    where: { stageId },
    include: { user: true },
  });
  return stageMembers;
}

export async function getStageMemberById({ memberId }: { memberId: string }) {
  const member = await prisma.stageMember.findUnique({
    where: { id: memberId },
    include: { user: true, stage: true },
  });
  return member;
}

export async function setStageMemberAsPic({
  memberId,
  stageId,
}: {
  memberId: string;
  stageId: string;
}) {
  return await prisma.$transaction(async (tx) => {
    await tx.stageMember.updateMany({
      where: { stageId },
      data: { role: "MEMBER" },
    });
    await tx.stageMember.update({
      where: { id: memberId },
      data: { role: "PIC" },
    });
    return null;
  });
}

export async function addStageMember({
  stageId,
  userId,
}: {
  stageId: string;
  userId: string;
}) {
  const stageMember = await prisma.stageMember.create({
    data: { stageId, userId },
  });
  return stageMember;
}

export async function isStageMember({
  stageId,
  userId,
}: {
  stageId: string;
  userId: string;
}) {
  const stageMember = await prisma.stageMember.findUnique({
    where: { stageId_userId: { stageId, userId } },
  });
  return Boolean(stageMember);
}
