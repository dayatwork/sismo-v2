// import prisma from "~/lib/prisma";

// export async function getStages({ projectId }: { projectId: string }) {
//   const stages = await prisma.stage.findMany({
//     where: { projectId },
//     include: {
//       milestones: { include: { tasks: true } },
//       members: { include: { user: true } },
//       project: { select: { id: true, name: true, status: true } },
//     },
//   });
//   return stages;
// }

// export async function getUserStages({ userId }: { userId: string }) {
//   const stages = await prisma.stage.findMany({
//     where: { members: { some: { userId } } },
//     select: {
//       id: true,
//       name: true,
//       project: { select: { id: true, name: true, status: true } },
//     },
//   });
//   return stages;
// }

// export async function getStageById({ id }: { id: string }) {
//   const stage = await prisma.stage.findUnique({
//     where: { id },
//     include: { project: true, members: { include: { user: true } } },
//   });
//   return stage;
// }

// export async function createStage({
//   description,
//   name,
//   projectId,
// }: {
//   projectId: string;
//   name: string;
//   description: string;
// }) {
//   const stagesCount = await prisma.stage.count({
//     where: { projectId },
//   });

//   const stage = await prisma.stage.create({
//     data: {
//       name,
//       description,
//       projectId,
//       stageOrder: stagesCount + 1,
//     },
//   });

//   return stage;
// }

// export async function startStage({ stageId }: { stageId: string }) {
//   const stage = await prisma.stage.update({
//     where: { id: stageId },
//     data: { status: "ONGOING" },
//   });
//   return stage;
// }

// export async function holdStage({ stageId }: { stageId: string }) {
//   const stage = await prisma.stage.update({
//     where: { id: stageId },
//     data: { status: "ONHOLD" },
//   });
//   return stage;
// }

// export async function completeStage({ stageId }: { stageId: string }) {
//   const stage = await prisma.stage.update({
//     where: { id: stageId },
//     data: { status: "COMPLETED" },
//   });
//   return stage;
// }

// export async function removeStageMember({ memberId }: { memberId: string }) {
//   const stageMember = await prisma.stageMember.delete({
//     where: { id: memberId },
//   });
//   return stageMember;
// }

// export async function getStageMembers({ stageId }: { stageId: string }) {
//   const stageMembers = await prisma.stageMember.findMany({
//     where: { stageId },
//     include: { user: true },
//   });
//   return stageMembers;
// }

// export async function getStageMemberById({ memberId }: { memberId: string }) {
//   const member = await prisma.stageMember.findUnique({
//     where: { id: memberId },
//     include: { user: true, stage: true },
//   });
//   return member;
// }

// export async function setStageMemberAsPic({
//   memberId,
//   stageId,
// }: {
//   memberId: string;
//   stageId: string;
// }) {
//   return await prisma.$transaction(async (tx) => {
//     await tx.stageMember.updateMany({
//       where: { stageId },
//       data: { role: "MEMBER" },
//     });
//     await tx.stageMember.update({
//       where: { id: memberId },
//       data: { role: "PIC" },
//     });
//     return null;
//   });
// }

// export async function addStageMember({
//   stageId,
//   userId,
// }: {
//   stageId: string;
//   userId: string;
// }) {
//   const stageMember = await prisma.stageMember.create({
//     data: { stageId, userId },
//   });
//   return stageMember;
// }

// export async function isStageMember({
//   stageId,
//   userId,
// }: {
//   stageId: string;
//   userId: string;
// }) {
//   const stageMember = await prisma.stageMember.findUnique({
//     where: { stageId_userId: { stageId, userId } },
//   });
//   return Boolean(stageMember);
// }
