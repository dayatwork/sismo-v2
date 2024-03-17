import ShortUniqueId from "short-unique-id";
import { type OrganizationSettings } from "@prisma/client";

import prisma from "~/lib/prisma";
import { hashPassword } from "./auth.server";
import redisClient from "~/lib/redis.server";

export async function createOrganization({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  const uid = new ShortUniqueId({ length: 6 });

  try {
    const organization = await prisma.organization.create({
      data: { id: uid.rnd(), name, description, settings: { create: {} } },
    });
    return organization;
  } catch (error) {
    console.log("[Create organization error]:", error);
    throw new Error("Failed to create organization");
  }
}

export async function getOrganizationById(id: string) {
  const organization = await prisma.organization.findUnique({ where: { id } });
  return organization;
}

export async function getOrganizationsWithStatistic() {
  let organizations = await prisma.organization.findMany({
    include: {
      organizationUsers: { select: { id: true } },
      projects: { select: { id: true } },
      tasks: { select: { id: true } },
      attachments: { select: { id: true } },
    },
  });

  return organizations.map((org) => ({
    id: org.id,
    name: org.name,
    description: org.description,
    isActive: org.isActive,
    totalUsers: org.organizationUsers.length || 0,
    totalProjects: org.projects.length || 0,
    totalTasks: org.tasks.length || 0,
    totalAttachments: org.attachments.length || 0,
  }));
}

export async function getUserOrganizations(userId: string) {
  const organizationUsers = await prisma.organizationUser.findMany({
    where: { userId, isActive: true },
    include: { organization: true },
  });

  const userOrganizations = organizationUsers.map((orgUser) => ({
    isActive: orgUser.isActive,
    isAdmin: orgUser.isAdmin,
    memberId: orgUser.memberId,
    memberStatus: orgUser.memberStatus,
    organization: orgUser.organization,
  }));

  return userOrganizations;
}

export async function getOrganizationUsersAndExcludeSomeIds({
  organizationId,
  excludeIds,
}: {
  organizationId: string;
  excludeIds: string[];
}) {
  const organizationUsers = await prisma.organizationUser.findMany({
    where: { organizationId, userId: { notIn: excludeIds } },
    include: { user: true },
  });
  return organizationUsers;
}

export async function addOrganizationAdmin({
  email,
  name,
  organizationId,
  password,
  memberId,
}: {
  organizationId: string;
  name: string;
  email: string;
  password?: string;
  memberId: string;
}) {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: {
          create: password ? { hash: await hashPassword(password) } : undefined,
        },
        organizationUsers: {
          create: {
            memberStatus: "FULLTIME",
            isAdmin: true,
            organizationId,
            memberId,
          },
        },
      },
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

export async function activateOrganization(id: string) {
  return await prisma.organization.update({
    where: { id },
    data: { isActive: true },
  });
}

export async function deactivateOrganization(id: string) {
  return await prisma.organization.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function updateOrganizationSettings({
  organizationId,
  allowClockinWithNewTask,
  allowClockinWithUnplannedTasks,
  allowEditTimeTracker,
  maxTimeTrackerInHours,
  timeTrackerEditLimitInDays,
  timeTrackerLimited,
  requireUploadAttachmentBeforeClockIn,
}: {
  organizationId: string;
  allowEditTimeTracker?: boolean;
  timeTrackerEditLimitInDays?: number;
  timeTrackerLimited?: boolean;
  maxTimeTrackerInHours?: number;
  allowClockinWithNewTask?: boolean;
  allowClockinWithUnplannedTasks?: boolean;
  requireUploadAttachmentBeforeClockIn?: boolean;
}) {
  const cacheKey = `settings:${organizationId}`;
  await redisClient.del(cacheKey);

  const settings = await prisma.organizationSettings.update({
    where: { organizationId },
    data: {
      allowClockinWithNewTask,
      allowClockinWithUnplannedTasks,
      allowEditTimeTracker,
      maxTimeTrackerInHours,
      timeTrackerEditLimitInDays,
      timeTrackerLimited,
      requireUploadAttachmentBeforeClockIn,
    },
  });

  return settings;
}

export async function getOrganizationSettings(organizationId: string) {
  let settings: OrganizationSettings | null;

  const cacheKey = `settings:${organizationId}`;
  const settingsCache = await redisClient.get(cacheKey);

  if (settingsCache) {
    settings = JSON.parse(settingsCache);
  } else {
    settings = await prisma.organizationSettings.findUnique({
      where: { organizationId },
    });
    redisClient.set(cacheKey, JSON.stringify(settings), "EX", 60 * 5);
  }

  return settings;
}
