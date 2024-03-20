import { type DepartmentRole } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function createDepartment({
  organizationId,
  name,
  description,
  logo,
}: {
  organizationId: string;
  name: string;
  description?: string;
  logo?: string;
}) {
  const department = await prisma.department.create({
    data: { organizationId, name, description, logo },
  });
  return department;
}

export async function updateDepartment({
  id,
  name,
  description,
  logo,
}: {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
}) {
  const department = await prisma.department.update({
    where: { id },
    data: { name, description, logo },
  });
  return department;
}

export async function deleteDepartment({ id }: { id: string }) {
  const department = await prisma.department.delete({
    where: { id },
  });
  return department;
}

export async function getDepartments({
  organizationId,
}: {
  organizationId: string;
}) {
  const organizations = await prisma.department.findMany({
    where: { organizationId },
  });
  return organizations;
}

export async function getDepartmentById({
  id,
  organizationId,
}: {
  organizationId: string;
  id: string;
}) {
  const organization = await prisma.department.findUnique({
    where: { id, organizationId },
    include: {
      departmentMembers: { include: { user: true }, orderBy: { role: "asc" } },
    },
  });
  return organization;
}

export async function addDepartmentMembers({
  departmentId,
  members,
  organizationId,
}: {
  departmentId: string;
  organizationId: string;
  members: { userId: string; role: DepartmentRole }[];
}) {
  const result = await prisma.departmentMember.createMany({
    // skipDuplicates: true,
    data: members.map((member) => ({
      departmentId,
      organizationId,
      role: member.role,
      userId: member.userId,
    })),
  });
  return result;
}

export async function removeDepartmentMembers({
  departmentId,
  members,
  organizationId,
}: {
  departmentId: string;
  organizationId: string;
  members: { userId: string }[];
}) {
  const result = await prisma.departmentMember.deleteMany({
    where: {
      departmentId,
      organizationId,
      userId: { in: members.map((member) => member.userId) },
    },
  });
  return result;
}

export async function updateDepartmentMemberRole({
  departmentId,
  role,
  userId,
}: {
  departmentId: string;
  userId: string;
  role: DepartmentRole;
}) {
  const departmentMember = await prisma.departmentMember.update({
    where: { userId_departmentId: { departmentId, userId } },
    data: { role },
  });
  return departmentMember;
}
