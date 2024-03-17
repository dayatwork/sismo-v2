import prisma from "~/lib/prisma";

export async function getRoles(organizationId: string) {
  const roles = await prisma.role.findMany({
    where: { organizationId },
    include: { users: { select: { id: true, name: true } } },
  });
  return roles;
}

export async function getRoleById({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  const role = await prisma.role.findUnique({
    where: { id, organizationId },
    include: { users: true },
  });
  return role;
}

export async function createRole({
  organizationId,
  name,
  permissions,
  description,
}: {
  organizationId: string;
  name: string;
  description?: string;
  permissions: string[];
}) {
  const role = await prisma.role.create({
    data: { name, description, organizationId, permissions },
  });
  return role;
}

export async function editRole({
  id,
  name,
  permissions,
  description,
}: {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}) {
  const role = await prisma.role.update({
    where: { id },
    data: { name, permissions, description },
  });
  return role;
}

export async function deleteRole({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  const role = await prisma.role.delete({ where: { id, organizationId } });
  return role;
}

export async function assignRoleToUser({
  organizationId,
  roleId,
  userId,
}: {
  roleId: string;
  organizationId: string;
  userId: string;
}) {
  const [userOrganizationCount, roleCount] = await Promise.all([
    prisma.organizationUser.count({ where: { userId, organizationId } }),
    prisma.role.count({ where: { id: roleId, organizationId } }),
  ]);

  if (!userOrganizationCount || !roleCount) {
    throw new Error("User or role not found in this organization");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { roles: { connect: { id: roleId } } },
  });
  return user;
}

export async function removeRoleFromUser({
  organizationId,
  roleId,
  userId,
}: {
  roleId: string;
  organizationId: string;
  userId: string;
}) {
  const organizationUser = await prisma.organizationUser.count({
    where: { userId, organizationId },
  });

  if (!organizationUser) {
    throw new Error("User not found in this organization");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { roles: { disconnect: { id: roleId } } },
  });

  return user;
}

export async function getUsersForAssignRole({
  organizationId,
  roleId,
}: {
  organizationId: string;
  roleId: string;
}) {
  // const users = await prisma.user.findMany({
  //   where: { id: { notIn: role.users.map((u) => u.id) } },
  //   include: { employee: true },
  // });
  const [role, organizationUsers] = await Promise.all([
    prisma.role.findUnique({
      where: { id: roleId, organizationId },
      include: { users: true },
    }),
    prisma.organizationUser.findMany({
      where: { organizationId },
      include: { user: true },
    }),
  ]);

  if (!role) {
    throw new Error("Role not found");
  }

  const roleUserIds = role.users.map((user) => user.id);

  const selectableUsers = organizationUsers
    .filter((orgUser) => !roleUserIds.includes(orgUser.userId))
    .map((orgUser) => orgUser.user);

  return selectableUsers;
}
