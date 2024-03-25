import prisma from "~/lib/prisma";

export async function getRoles() {
  const roles = await prisma.role.findMany({
    include: { users: { select: { id: true, name: true } } },
  });
  return roles;
}

export async function getRoleById({ id }: { id: string }) {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { users: true },
  });
  return role;
}

export async function createRole({
  name,
  permissions,
  description,
}: {
  name: string;
  description?: string;
  permissions: string[];
}) {
  const role = await prisma.role.create({
    data: { name, description, permissions },
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

export async function deleteRole({ id }: { id: string }) {
  const role = await prisma.role.delete({ where: { id } });
  return role;
}

export async function assignRoleToUser({
  roleId,
  userId,
}: {
  roleId: string;
  userId: string;
}) {
  const [userCount, roleCount] = await Promise.all([
    prisma.user.count({ where: { id: userId } }),
    prisma.role.count({ where: { id: roleId } }),
  ]);

  if (!userCount || !roleCount) {
    throw new Error("User or role not found");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { roles: { connect: { id: roleId } } },
  });
  return user;
}

export async function removeRoleFromUser({
  roleId,
  userId,
}: {
  roleId: string;
  userId: string;
}) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { roles: { disconnect: { id: roleId } } },
  });

  return user;
}

export async function getUsersForAssignRole({ roleId }: { roleId: string }) {
  const [role, users] = await Promise.all([
    prisma.role.findUnique({
      where: { id: roleId },
      include: { users: true },
    }),
    prisma.user.findMany(),
  ]);

  if (!role) {
    throw new Error("Role not found");
  }

  const roleUserIds = role.users.map((user) => user.id);

  const selectableUsers = users.filter(
    (user) => !roleUserIds.includes(user.id)
  );

  return selectableUsers;
}
