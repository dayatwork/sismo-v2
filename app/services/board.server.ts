import { type BoardPrivacy } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function createBoard({
  name,
  description,
  privacy,
  workspaceId,
}: {
  name: string;
  description?: string;
  privacy: BoardPrivacy;
  workspaceId: string;
}) {
  const board = await prisma.board.create({
    data: { name, description, privacy, workspaceId },
  });
  return board;
}

export async function updateBoard({
  id,
  name,
  description,
}: {
  id: string;
  name?: string;
  description?: string;
}) {
  const board = await prisma.board.update({
    where: { id },
    data: { name, description },
  });
  return board;
}

export async function changeBoardPrivacy({
  id,
  privacy,
}: {
  id: string;
  privacy: BoardPrivacy;
}) {
  const board = await prisma.board.update({
    where: { id },
    data: { privacy },
  });
  return board;
}

export async function archiveBoard({ id }: { id: string }) {
  return await prisma.$transaction(async (tx) => {
    const board = await tx.board.findUnique({ where: { id } });
    if (board?.status !== "ACTIVE") {
      throw new Error("Only for active board");
    }
    return await tx.board.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  });
}

export async function restoreBoard({ id }: { id: string }) {
  return await prisma.board.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
}

export async function softDeleteBoard({ id }: { id: string }) {
  return await prisma.$transaction(async (tx) => {
    const board = await tx.board.findUnique({ where: { id } });
    if (board?.status !== "ARCHIVED") {
      throw new Error("Can't delete active board");
    }
    return await tx.board.update({
      where: { id },
      data: { status: "DELETED" },
    });
  });
}

export async function hardDeleteBoard({ id }: { id: string }) {
  return await prisma.$transaction(async (tx) => {
    const board = await tx.board.findUnique({ where: { id } });
    if (board?.status !== "DELETED") {
      throw new Error("Can't delete active or archived board");
    }
    return await tx.board.delete({
      where: { id },
    });
  });
}

type GetBoardProps = {
  workspaceId?: string;
};
export async function getBoards(props?: GetBoardProps) {
  const boards = await prisma.board.findMany({
    where: { workspaceId: props?.workspaceId },
    include: {
      workspace: true,
      boardMembers: {
        include: { user: { select: { id: true, name: true, photo: true } } },
      },
    },
  });
  return boards;
}

export async function getBoardById({ id }: { id: string }) {
  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      boardMembers: {
        include: {
          user: { select: { id: true, name: true, photo: true } },
        },
      },
      taskGroups: { include: { tasks: true } },
      workspace: true,
    },
  });
  return board;
}

export async function addBoardMembers({
  boardId,
  members,
}: {
  boardId: string;
  members: { userId: string; isOwner: boolean }[];
}) {
  const result = await prisma.boardMember.createMany({
    data: members.map((member) => ({
      boardId,
      userId: member.userId,
      isOwner: member.isOwner,
    })),
  });
  return result;
}

export async function removeBoardMembers({
  boardId,
  members,
}: {
  boardId: string;
  members: { userId: string }[];
}) {
  const result = await prisma.boardMember.deleteMany({
    where: {
      boardId,
      userId: { in: members.map((member) => member.userId) },
    },
  });
  return result;
}

export async function updateBoardMemberRole({
  boardId,
  userId,
  isOwner,
}: {
  boardId: string;
  userId: string;
  isOwner: boolean;
}) {
  const boardMember = await prisma.boardMember.update({
    where: { boardId_userId: { boardId, userId } },
    data: { isOwner },
  });
  return boardMember;
}
