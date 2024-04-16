import { type WorkspaceStatus, type WorkspacePrivacy } from "@prisma/client";
import prisma from "~/lib/prisma";
import { type LoggedInUserPayload } from "~/utils/auth.server";
import { authenticator } from "./auth.server";
import { getUserById } from "./user.server";
import { redirect } from "@remix-run/node";
import { type WorkspacePermissionName } from "~/utils/workspace.permission";

type GetWorkspaceProps = {
  status?: WorkspaceStatus;
};
export async function getWorkspaces(props?: GetWorkspaceProps) {
  const workspaces = await prisma.workspace.findMany({
    where: { status: props?.status },
    include: {
      owner: { select: { id: true, name: true, photo: true } },
      workspaceMembers: {
        include: { user: { select: { id: true, name: true, photo: true } } },
      },
      boards: { select: { id: true } },
    },
  });
  return workspaces;
}

export async function getWorkspaceById({ id }: { id: string }) {
  const workspace = await prisma.workspace.findUnique({
    where: { id },
    include: {
      boards: true,
      owner: { select: { id: true, name: true, photo: true } },
      workspaceMembers: {
        include: {
          user: { select: { id: true, name: true, photo: true } },
          role: true,
        },
      },
      workspaceRoles: true,
    },
  });
  return workspace;
}

export async function createWorkspace({
  name,
  description,
  privacy,
  ownerId,
}: {
  name: string;
  description?: string;
  privacy: WorkspacePrivacy;
  ownerId: string;
}) {
  const workspace = await prisma.workspace.create({
    data: { name, description, privacy, ownerId },
  });
  return workspace;
}

export async function updateWorkspace({
  id,
  name,
  description,
  coverImage,
  brandColor,
  privacy,
}: {
  id: string;
  name?: string;
  description?: string;
  coverImage?: string;
  brandColor?: string;
  privacy?: WorkspacePrivacy;
}) {
  const workspace = await prisma.workspace.update({
    where: { id },
    data: { name, description, coverImage, brandColor, privacy },
  });
  return workspace;
}

export async function archiveWorkspace({ id }: { id: string }) {
  return await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.findUnique({ where: { id } });
    if (workspace?.status !== "ACTIVE") {
      throw new Error("Only for active workspace");
    }
    return await tx.workspace.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  });
}

export async function restoreWorkspace({ id }: { id: string }) {
  return await prisma.workspace.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
}

export async function softDeleteWorkspace({ id }: { id: string }) {
  return await prisma.$transaction(async (tx) => {
    // const workspace = await tx.workspace.findUnique({ where: { id } });
    // if (workspace?.status !== "ARCHIVED") {
    //   throw new Error("Can't delete active workspace");
    // }
    return await tx.workspace.update({
      where: { id },
      data: { status: "DELETED" },
    });
  });
}

export async function hardDeleteWorkspace({ id }: { id: string }) {
  return await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.findUnique({ where: { id } });
    if (workspace?.status !== "DELETED") {
      throw new Error("Can't delete active or archived workspace");
    }
    return await tx.workspace.delete({
      where: { id },
    });
  });
}

export async function getWorkspaceRoles({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const workspaceRoles = await prisma.workspaceRole.findMany({
    where: { workspaceId },
  });

  return workspaceRoles;
}

export async function createWorkspaceRole({
  name,
  permissions,
  workspaceId,
  description,
}: {
  workspaceId: string;
  name: string;
  description?: string;
  permissions: string[];
}) {
  const workspaceRole = await prisma.workspaceRole.create({
    data: { name, description, workspaceId, permissions },
  });
  return workspaceRole;
}

export async function editWorkspaceRole({
  id,
  name,
  permissions,
  description,
}: {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}) {
  const workspaceRole = await prisma.workspaceRole.update({
    where: { id },
    data: { name, description, permissions },
  });
  return workspaceRole;
}

export async function removeWorkspaceRoles({
  workspaceId,
  roleIds,
}: {
  workspaceId: string;
  roleIds: string[];
}) {
  const result = await prisma.workspaceRole.deleteMany({
    where: {
      workspaceId,
      id: { in: roleIds },
    },
  });
  return result;
}

export async function addWorkspaceMembers({
  workspaceId,
  members,
}: {
  workspaceId: string;
  members: { userId: string; roleId: string }[];
}) {
  const result = await prisma.workspaceMember.createMany({
    data: members.map((member) => ({
      workspaceId,
      roleId: member.roleId,
      userId: member.userId,
    })),
  });
  return result;
}

export async function removeWorkspaceMembers({
  workspaceId,
  memberIds,
}: {
  workspaceId: string;
  memberIds: string[];
}) {
  const result = await prisma.workspaceMember.deleteMany({
    where: {
      workspaceId,
      userId: { in: memberIds },
    },
  });
  return result;
}

export async function updateWorkspaceMemberRole({
  workspaceId,
  roleId,
  userId,
}: {
  workspaceId: string;
  userId: string;
  roleId: string;
}) {
  const workspaceMember = await prisma.workspaceMember.update({
    where: { userId_workspaceId: { userId, workspaceId } },
    data: { roleId },
  });
  return workspaceMember;
}

export async function getTaskDashboardData() {
  const [workspaces, boards, tasks] = await prisma.$transaction([
    prisma.workspace.findMany(),
    prisma.board.findMany(),
    prisma.boardTask.findMany(),
  ]);

  const totalWorkspaces = workspaces.length;
  const totalActiveWorkspaces = workspaces.filter(
    (ws) => ws.status === "ACTIVE"
  ).length;
  const totalPrivateWorkspaces = workspaces.filter(
    (ws) => ws.privacy === "CLOSED"
  ).length;

  const totalBoards = boards.length;
  const totalActiveBoards = boards.filter(
    (board) => board.status === "ACTIVE"
  ).length;
  const totalPrivateBoards = boards.filter(
    (board) => board.privacy === "PRIVATE"
  ).length;

  const totalTasks = tasks.length;
  let totalBacklogTasks = 0;
  let totalTodoTasks = 0;
  let totalInProgressTasks = 0;
  let totalDoneTasks = 0;
  let totalOnHoldTasks = 0;
  let totalStuckTasks = 0;

  tasks.forEach((task) => {
    if (task.status === "BACKLOG") {
      totalBacklogTasks++;
    } else if (task.status === "TODO") {
      totalTodoTasks++;
    } else if (task.status === "IN_PROGRESS") {
      totalInProgressTasks++;
    } else if (task.status === "DONE") {
      totalDoneTasks++;
    } else if (task.status === "ON_HOLD") {
      totalOnHoldTasks++;
    } else if (task.status === "STUCK") {
      totalStuckTasks++;
    }
  });

  const users = await prisma.user.findMany({
    include: {
      workspaceMembers: { select: { workspaceId: true } },
      boardMembers: { select: { boardId: true } },
      boardTasks: { select: { id: true, status: true } },
    },
  });

  const usersData = users.map((user) => ({
    id: user.id,
    name: user.name,
    photo: user.photo,
    totalWorkspaces: user.workspaceMembers.length,
    totalBoards: user.boardMembers.length,
    totalTasks: user.boardTasks.length,
    totalCompletedTasks: user.boardTasks.filter(
      (task) => task.status === "DONE"
    ).length,
  }));

  return {
    totalWorkspaces,
    totalBoards,
    totalTasks,
    totalActiveWorkspaces,
    totalPrivateWorkspaces,
    totalActiveBoards,
    totalPrivateBoards,
    totalBacklogTasks,
    totalTodoTasks,
    totalInProgressTasks,
    totalDoneTasks,
    totalOnHoldTasks,
    totalStuckTasks,
    usersData,
  };
}

// ===============================================
// =========== WORKSPACE PERMISSIONS =============
// ===============================================
export async function requireWorkspacePermission(
  request: Request,
  workspaceId: string,
  permission: WorkspacePermissionName
): Promise<{
  user: LoggedInUserPayload;
  workspace: Awaited<ReturnType<typeof getWorkspaceById>>;
  allowed: boolean;
}> {
  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUserById(userId);

  if (!user) {
    throw redirect("/login");
  }

  const workspace = await getWorkspaceById({ id: workspaceId });
  if (!workspace) {
    throw redirect("/app/workspaces");
  }

  if (user.isSuperAdmin) {
    return { user, workspace, allowed: true };
  }

  if (workspace.ownerId === user.id) {
    return { user, workspace, allowed: true };
  }

  const userMember = workspace.workspaceMembers.find(
    (wm) => wm.userId === user.id
  );

  if (!userMember) {
    return { user, workspace, allowed: false };
  }

  const allowed = userMember.role.permissions.includes(permission);

  return { user, workspace, allowed };
}
