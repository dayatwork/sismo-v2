import { type DepartmentRole } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function createDepartment({
  name,
  description,
  logo,
}: {
  name: string;
  description?: string;
  logo?: string;
}) {
  const department = await prisma.department.create({
    data: { name, description, logo },
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

export async function getDepartments() {
  const departments = await prisma.department.findMany();
  return departments;
}

export async function getDepartmentById({ id }: { id: string }) {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      departmentMembers: { include: { user: true }, orderBy: { role: "asc" } },
    },
  });
  return department;
}

export async function addDepartmentMembers({
  departmentId,
  members,
}: {
  departmentId: string;
  members: { userId: string; role: DepartmentRole }[];
}) {
  const result = await prisma.departmentMember.createMany({
    // skipDuplicates: true,
    data: members.map((member) => ({
      departmentId,
      role: member.role,
      userId: member.userId,
    })),
  });
  return result;
}

export async function removeDepartmentMembers({
  departmentId,
  members,
}: {
  departmentId: string;
  members: { userId: string }[];
}) {
  const result = await prisma.departmentMember.deleteMany({
    where: {
      departmentId,
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
