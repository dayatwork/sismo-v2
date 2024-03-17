import { v4 as uuid } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { type MemberStatus } from "@prisma/client";

import prisma from "~/lib/prisma";
import { s3Client } from "~/lib/s3.server";

export const memberStatuses: { label: string; value: MemberStatus }[] = [
  { label: "Full-time", value: "FULLTIME" },
  { label: "Part-time", value: "PARTTIME" },
  { label: "Intern", value: "INTERN" },
  { label: "Outsourced", value: "OUTSOURCED" },
];

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { password: true },
  });
  if (!user) {
    return null;
  }
  const { password, ...userData } = user;
  return { ...userData, hasPassword: !!password?.hash };
}

export async function getUserByIdWithPasswordHash(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { password: true },
  });
  return user;
}

export async function getUserWithOrganizations(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      organizationUsers: { include: { organization: true } },
      roles: true,
    },
  });

  return user;
}

export async function getOrganizationUser({
  organizationId,
  userId,
}: {
  userId: string;
  organizationId: string;
}) {
  const user = await prisma.organizationUser.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    include: {
      organization: true,
      user: {
        include: {
          connections: true,
          password: true,
          roles: true,
          positions: {
            include: {
              division: { include: { directorate: true } },
              jobLevel: true,
            },
          },
        },
      },
    },
  });
  return user;
}

export async function getOrganizationUsers(organizationId: string) {
  const orgUsers = await prisma.organizationUser.findMany({
    where: { organizationId },
    include: { user: { include: { roles: true } } },
  });
  return orgUsers;
}

export async function deleteOrganizationUser({
  organizationId,
  userId,
}: {
  userId: string;
  organizationId: string;
}) {
  const organizationUser = await prisma.organizationUser.delete({
    where: { organizationId_userId: { organizationId, userId } },
  });
  return organizationUser;
}

export async function getUsers() {
  const users = await prisma.user.findMany();
  return users;
}

export async function activateUser(id: string) {
  return await prisma.user.update({
    where: { id },
    data: { isActive: true },
  });
}

export async function deactivateUser(id: string) {
  return await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function activateOrganizationUser({
  organizationId,
  userId,
}: {
  userId: string;
  organizationId: string;
}) {
  const organizationUser = await prisma.organizationUser.update({
    where: { organizationId_userId: { organizationId, userId } },
    data: { isActive: true },
  });
  return organizationUser;
}

export async function deactivateOrganizationUser({
  organizationId,
  userId,
}: {
  userId: string;
  organizationId: string;
}) {
  const organizationUser = await prisma.organizationUser.update({
    where: { organizationId_userId: { organizationId, userId } },
    data: { isActive: false },
  });
  return organizationUser;
}

export async function editOrganizationUser({
  organizationId,
  userId,
  email,
  memberId,
  memberStatus,
  name,
}: {
  userId: string;
  organizationId: string;
  name?: string;
  email?: string;
  memberId?: string;
  memberStatus?: MemberStatus;
}) {
  const organizationUser = await prisma.organizationUser.update({
    where: { organizationId_userId: { organizationId, userId } },
    data: { memberId, memberStatus, user: { update: { name, email } } },
  });
  return organizationUser;
}

export async function changePhoneNumber(id: string, phone: string) {
  const user = await prisma.user.update({ where: { id }, data: { phone } });
  return user;
}

export async function changeUserPhoto({
  userId,
  photo,
}: {
  userId: string;
  photo: File;
}) {
  const fileId = uuid();
  const fileName = `avatar/${fileId}.${photo.name.split(".").slice(-1)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(await photo.arrayBuffer()),
    ContentType: photo.type,
    ACL: "public-read",
  });

  await s3Client.send(command);

  const photoPath = `${process.env.S3_END_POINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { photo: photoPath },
  });

  return user;
}

export async function createOrganizationUser({
  memberId,
  memberStatus,
  email,
  name,
  organizationId,
}: {
  organizationId: string;
  name: string;
  email: string;
  memberId: string;
  memberStatus: MemberStatus;
}) {
  try {
    const user = await prisma.$transaction(async (tx) => {
      const foundUser = await tx.user.findUnique({ where: { email } });
      if (!foundUser) {
        const user = await prisma.user.create({
          data: {
            email,
            name,
            organizationUsers: {
              create: { memberStatus, memberId, organizationId },
            },
          },
        });
        return user;
      }

      const updatedUser = await prisma.user.update({
        where: { id: foundUser.id },
        data: {
          name,
          organizationUsers: {
            create: { memberStatus, memberId, organizationId },
          },
        },
      });

      return updatedUser;
    });

    return user;
  } catch (error: any) {
    if (error.code === "P2002") {
      const target = error.meta?.target as string[];
      let message = "Email or member ID already exists";
      if (target.includes("email")) {
        message = "Email already exists";
      } else if (target.includes("memberId")) {
        message = "Member ID already exist";
      }
      throw new Error(message);
    }
  }
}
