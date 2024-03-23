import { type TeamRole } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function createTeam({
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
  const team = await prisma.team.create({
    data: { organizationId, name, description, logo },
  });
  return team;
}

export async function updateTeam({
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
  const team = await prisma.team.update({
    where: { id },
    data: { name, description, logo },
  });
  return team;
}

export async function deleteTeam({ id }: { id: string }) {
  const team = await prisma.team.delete({
    where: { id },
  });
  return team;
}

export async function getTeams({ organizationId }: { organizationId: string }) {
  const teams = await prisma.team.findMany({
    where: { organizationId },
  });
  return teams;
}

export async function getTeamById({
  id,
  organizationId,
}: {
  organizationId: string;
  id: string;
}) {
  const team = await prisma.team.findUnique({
    where: { id, organizationId },
    include: {
      teamMembers: { include: { user: true }, orderBy: { role: "asc" } },
    },
  });
  return team;
}

export async function addTeamMembers({
  teamId,
  members,
  organizationId,
}: {
  teamId: string;
  organizationId: string;
  members: { userId: string; role: TeamRole }[];
}) {
  const result = await prisma.teamMember.createMany({
    // skipDuplicates: true,
    data: members.map((member) => ({
      teamId,
      organizationId,
      role: member.role,
      userId: member.userId,
    })),
  });
  return result;
}

export async function removeTeamMembers({
  teamId,
  members,
  organizationId,
}: {
  teamId: string;
  organizationId: string;
  members: { userId: string }[];
}) {
  const result = await prisma.teamMember.deleteMany({
    where: {
      teamId,
      organizationId,
      userId: { in: members.map((member) => member.userId) },
    },
  });
  return result;
}

export async function updateTeamMemberRole({
  teamId,
  role,
  userId,
}: {
  teamId: string;
  userId: string;
  role: TeamRole;
}) {
  const teamMember = await prisma.teamMember.update({
    where: { userId_teamId: { teamId, userId } },
    data: { role },
  });
  return teamMember;
}
