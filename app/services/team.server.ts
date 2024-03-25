import { type TeamRole } from "@prisma/client";
import prisma from "~/lib/prisma";

export async function createTeam({
  name,
  description,
  logo,
}: {
  name: string;
  description?: string;
  logo?: string;
}) {
  const team = await prisma.team.create({
    data: { name, description, logo },
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

export async function getTeams() {
  const teams = await prisma.team.findMany({});
  return teams;
}

export async function getTeamById({ id }: { id: string }) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      teamMembers: { include: { user: true }, orderBy: { role: "asc" } },
    },
  });
  return team;
}

export async function addTeamMembers({
  teamId,
  members,
}: {
  teamId: string;
  members: { userId: string; role: TeamRole }[];
}) {
  const result = await prisma.teamMember.createMany({
    // skipDuplicates: true,
    data: members.map((member) => ({
      teamId,
      role: member.role,
      userId: member.userId,
    })),
  });
  return result;
}

export async function removeTeamMembers({
  teamId,
  members,
}: {
  teamId: string;
  members: { userId: string }[];
}) {
  const result = await prisma.teamMember.deleteMany({
    where: {
      teamId,
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
