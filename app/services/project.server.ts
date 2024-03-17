import ShortUniqueId from "short-unique-id";

import prisma from "~/lib/prisma";

export async function createNewProject({
  name,
  description,
  code,
  organizationId,
  championId,
  productId,
  serviceId,
}: {
  name: string;
  organizationId: string;
  code?: string;
  description?: string;
  championId?: string;
  productId?: string;
  serviceId?: string;
}) {
  const uid = new ShortUniqueId({ length: 10 });

  const project = await prisma.project.create({
    data: {
      code: code || uid.rnd(),
      name,
      description,
      organizationId,
      championId,
      productId,
      serviceId,
    },
  });
  return project;
}

export async function getProjects({
  organizationId,
}: {
  organizationId: string;
}) {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    include: {
      projectClients: { include: { client: true } },
      champion: { select: { id: true, name: true, photo: true } },
      product: true,
      service: true,
    },
  });
  return projects;
}

export async function getProjectById({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  const project = await prisma.project.findUnique({
    where: { id, organizationId },
    include: {
      projectClients: { include: { client: true } },
      champion: { select: { id: true, name: true, photo: true } },
      product: true,
      service: true,
    },
  });
  return project;
}

export async function getProjectClients({ projectId }: { projectId: string }) {
  const projectClients = await prisma.projectClient.findMany({
    where: { projectId },
    include: { client: true },
    orderBy: {
      createdAt: "asc",
    },
  });
  return projectClients;
}

export async function getProjectClientById({ id }: { id: string }) {
  const projectClient = await prisma.projectClient.findUnique({
    where: { id },
  });
  return projectClient;
}

export async function addProjectClient({
  clientId,
  projectId,
}: {
  clientId: string;
  projectId: string;
}) {
  const projectClient = await prisma.projectClient.create({
    data: { clientId, projectId },
  });

  return projectClient;
}

export async function getClientsAndExcludeSomeIds({
  excludeIds,
  organizationId,
}: {
  excludeIds: string[];
  organizationId: string;
}) {
  const clients = await prisma.client.findMany({
    where: { organizationId, id: { notIn: excludeIds } },
  });
  return clients;
}

export async function setMainClient({
  projectClientId,
  projectId,
}: {
  projectId: string;
  projectClientId: string;
}) {
  return await prisma.$transaction(async (tx) => {
    await tx.projectClient.updateMany({
      where: { projectId },
      data: { isMain: false },
    });
    await tx.projectClient.update({
      where: {
        id: projectClientId,
      },
      data: { isMain: true },
    });
    // Update project code
  });
}

export async function cancelProject({
  organizationId,
  projectId,
}: {
  projectId: string;
  organizationId: string;
}) {
  const project = await prisma.project.update({
    where: { id: projectId, organizationId },
    data: { status: "CANCELED" },
  });
  return project;
}

export async function closeProject({
  organizationId,
  projectId,
  closingReason,
}: {
  organizationId: string;
  projectId: string;
  closingReason: "COMPLETE" | "CANCEL";
}) {
  const project = await prisma.project.update({
    where: { id: projectId, organizationId },
    data: { status: "CLOSING", closingReason },
  });
  return project;
}

export async function completeProject({
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId: string;
}) {
  const project = await prisma.project.update({
    where: { id: projectId, organizationId },
    data: { status: "COMPLETED" },
  });
  return project;
}

export async function holdProject({
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId: string;
}) {
  const project = await prisma.project.update({
    where: { id: projectId, organizationId },
    data: { status: "ONHOLD" },
  });
  return project;
}

export async function startProject({
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId: string;
}) {
  const project = await prisma.project.update({
    where: { id: projectId, organizationId },
    data: { status: "ONGOING" },
  });
  return project;
}

export async function deleteProject({
  organizationId,
  projectId,
}: {
  projectId: string;
  organizationId: string;
}) {
  const project = await prisma.project.delete({
    where: { id: projectId, organizationId },
  });
  return project;
}

export async function editProjectName({
  organizationId,
  projectId,
  description,
  name,
}: {
  organizationId: string;
  projectId: string;
  name?: string;
  description?: string;
}) {
  const project = await prisma.project.update({
    where: { organizationId, id: projectId },
    data: { name, description },
  });
  return project;
}

export async function editProjectServiceOrProduct({
  organizationId,
  projectId,
  serviceId,
  productId,
}: {
  organizationId: string;
  projectId: string;
  serviceId?: string;
  productId?: string;
}) {
  const project = await prisma.project.update({
    where: { organizationId, id: projectId },
    data: { serviceId, productId },
  });
  return project;
}

export async function changeProjectChampion({
  championId,
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId: string;
  championId: string;
}) {
  const project = await prisma.project.update({
    where: { organizationId, id: projectId },
    data: { championId },
  });
  return project;
}

export async function getProjectsWithStatistic({
  organizationId,
  search,
}: {
  organizationId: string;
  search?: string;
}) {
  const projects = await prisma.project.findMany({
    where: {
      organizationId,
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      projectClients: { include: { client: true } },
      champion: { select: { id: true, name: true, photo: true } },
      product: true,
      service: true,
      stages: {
        select: {
          id: true,
          stageOrder: true,
          name: true,
          status: true,
          milestones: {
            select: {
              id: true,
              weight: true,
              tasks: { select: { id: true, status: true } },
            },
          },
        },
      },
    },
  });
  return projects;
}
