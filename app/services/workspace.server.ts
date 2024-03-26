import { type WorkspacePrivacy } from "@prisma/client";
import prisma from "~/lib/prisma";
import { type LoggedInUserPayload } from "~/utils/auth.server";
import { authenticator } from "./auth.server";
import { getUserById } from "./user.server";
import { redirect } from "@remix-run/node";

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
}: {
  id: string;
  name?: string;
  description?: string;
  coverImage?: string;
  brandColor?: string;
}) {
  const workspace = await prisma.workspace.update({
    where: { id },
    data: { name, description, coverImage, brandColor },
  });
  return workspace;
}

export async function changeWorkspacePrivacy({
  id,
  privacy,
}: {
  id: string;
  privacy: WorkspacePrivacy;
}) {
  const workspace = await prisma.workspace.update({
    where: { id },
    data: { privacy },
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
    const workspace = await tx.workspace.findUnique({ where: { id } });
    if (workspace?.status !== "ARCHIVED") {
      throw new Error("Can't delete active workspace");
    }
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

export async function getWorkspaces() {
  const workspaces = await prisma.workspace.findMany({
    include: {
      owner: { select: { id: true, name: true, photo: true } },
      workspaceMembers: {
        include: { user: { select: { id: true, name: true, photo: true } } },
      },
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
  members,
}: {
  workspaceId: string;
  members: { userId: string }[];
}) {
  const result = await prisma.workspaceMember.deleteMany({
    where: {
      workspaceId,
      userId: { in: members.map((member) => member.userId) },
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

// ===============================================
// =========== WORKSPACE PERMISSIONS =============
// ===============================================
export type WorkspacePermission = {
  group: string;
  name: string;
  description: string;
};

export const workspacePermissions = [
  {
    group: "board",
    name: "manage:board",
    description: "Akses untuk manage workspace board",
  },
  {
    group: "member",
    name: "manage:member",
    description: "Akses untuk manage workspace member",
  },
  {
    group: "permission",
    name: "manage:permission",
    description: "Akses untuk manage workspace permission",
  },
] as const;

export type WorkspacePermissionName =
  (typeof workspacePermissions)[number]["name"];

type GroupedWorkspacePermission = {
  groupName: string;
  permissions: {
    group: string;
    name: string;
    description: string;
  }[];
};

export const groupedWorkspacePermissions = workspacePermissions.reduce(
  (acc, permission) => {
    const existingGroup = acc.find(
      (group) => group.groupName === permission.group
    );

    if (existingGroup) {
      existingGroup.permissions.push({
        group: permission.group,
        name: permission.name,
        description: permission.description,
      });
    } else {
      acc.push({
        groupName: permission.group,
        permissions: [
          {
            group: permission.group,
            name: permission.name,
            description: permission.description,
          },
        ],
      });
    }

    return acc;
  },
  [] as GroupedWorkspacePermission[]
);

type WorkspacePermissionLookup = Record<string, WorkspacePermission>;

export const workspacePermissionsLookup = workspacePermissions.reduce(
  (acc, curr) => {
    return { ...acc, [curr.name]: curr };
  },
  {} as WorkspacePermissionLookup
);

export const hasWorkspacePermissions = (permission: string | string[]) => {
  if (typeof permission === "string") {
    return Boolean(workspacePermissionsLookup[permission]);
  }
  permission.forEach((p) => {
    if (workspacePermissionsLookup[p]) {
      return true;
    }
  });
  return false;
};

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
