import ShortUniqueId from "short-unique-id";

import prisma from "~/lib/prisma";

export async function createNewProject({
  name,
  description,
  code,
}: {
  name: string;
  code?: string;
  description?: string;
}) {
  const uid = new ShortUniqueId({ length: 10 });

  const project = await prisma.project.create({
    data: {
      code: code || uid.rnd(),
      name,
      description,
    },
  });
  return project;
}

export async function getProjects() {
  const projects = await prisma.project.findMany();
  return projects;
}

export async function getProjectById({ id }: { id: string }) {
  const project = await prisma.project.findUnique({
    where: { id },
  });
  return project;
}

export async function editProject({
  projectId,
  description,
  name,
}: {
  projectId: string;
  name?: string;
  description?: string;
}) {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name, description },
  });
  return project;
}

export async function deleteProject({ projectId }: { projectId: string }) {
  const project = await prisma.project.delete({
    where: { id: projectId },
  });
  return project;
}

// import ShortUniqueId from "short-unique-id";

// import prisma from "~/lib/prisma";

// export async function createNewProject({
//   name,
//   description,
//   code,
//   championId,
//   productId,
//   serviceId,
// }: {
//   name: string;
//   code?: string;
//   description?: string;
//   championId?: string;
//   productId?: string;
//   serviceId?: string;
// }) {
//   const uid = new ShortUniqueId({ length: 10 });

//   const project = await prisma.project.create({
//     data: {
//       code: code || uid.rnd(),
//       name,
//       description,
//       championId,
//       productId,
//       serviceId,
//     },
//   });
//   return project;
// }

// export async function getProjects() {
//   const projects = await prisma.project.findMany({
//     include: {
//       projectClients: { include: { client: true } },
//       champion: { select: { id: true, name: true, photo: true } },
//       product: true,
//       service: true,
//     },
//   });
//   return projects;
// }

// export async function getProjectById({ id }: { id: string }) {
//   const project = await prisma.project.findUnique({
//     where: { id },
//     include: {
//       projectClients: { include: { client: true } },
//       champion: { select: { id: true, name: true, photo: true } },
//       product: true,
//       service: true,
//     },
//   });
//   return project;
// }

// export async function getProjectClients({ projectId }: { projectId: string }) {
//   const projectClients = await prisma.projectClient.findMany({
//     where: { projectId },
//     include: { client: true },
//     orderBy: {
//       createdAt: "asc",
//     },
//   });
//   return projectClients;
// }

// export async function getProjectClientById({ id }: { id: string }) {
//   const projectClient = await prisma.projectClient.findUnique({
//     where: { id },
//   });
//   return projectClient;
// }

// export async function addProjectClient({
//   clientId,
//   projectId,
// }: {
//   clientId: string;
//   projectId: string;
// }) {
//   const projectClient = await prisma.projectClient.create({
//     data: { clientId, projectId },
//   });

//   return projectClient;
// }

// export async function getClientsAndExcludeSomeIds({
//   excludeIds,
// }: {
//   excludeIds: string[];
// }) {
//   const clients = await prisma.client.findMany({
//     where: { id: { notIn: excludeIds } },
//   });
//   return clients;
// }

// export async function setMainClient({
//   projectClientId,
//   projectId,
// }: {
//   projectId: string;
//   projectClientId: string;
// }) {
//   return await prisma.$transaction(async (tx) => {
//     await tx.projectClient.updateMany({
//       where: { projectId },
//       data: { isMain: false },
//     });
//     await tx.projectClient.update({
//       where: {
//         id: projectClientId,
//       },
//       data: { isMain: true },
//     });
//     // Update project code
//   });
// }

// export async function cancelProject({ projectId }: { projectId: string }) {
//   const project = await prisma.project.update({
//     where: { id: projectId },
//     data: { status: "CANCELED" },
//   });
//   return project;
// }

// export async function closeProject({
//   projectId,
//   closingReason,
// }: {
//   projectId: string;
//   closingReason: "COMPLETE" | "CANCEL";
// }) {
//   const project = await prisma.project.update({
//     where: { id: projectId },
//     data: { status: "CLOSING", closingReason },
//   });
//   return project;
// }

// export async function completeProject({ projectId }: { projectId: string }) {
//   const project = await prisma.project.update({
//     where: { id: projectId },
//     data: { status: "COMPLETED" },
//   });
//   return project;
// }

// export async function holdProject({ projectId }: { projectId: string }) {
//   const project = await prisma.project.update({
//     where: { id: projectId },
//     data: { status: "ONHOLD" },
//   });
//   return project;
// }

// export async function startProject({ projectId }: { projectId: string }) {
//   const project = await prisma.project.update({
//     where: { id: projectId },
//     data: { status: "ONGOING" },
//   });
//   return project;
// }

// export async function deleteProject({ projectId }: { projectId: string }) {
//   const project = await prisma.project.delete({
//     where: { id: projectId },
//   });
//   return project;
// }

// export async function editProjectName({
//   projectId,
//   description,
//   name,
// }: {
//   projectId: string;
//   name?: string;
//   description?: string;
// }) {
//   const project = await prisma.project.update({
//     where: { id: projectId },
//     data: { name, description },
//   });
//   return project;
// }

// export async function editProjectServiceOrProduct({
//   projectId,
//   serviceId,
//   productId,
// }: {
//   projectId: string;
//   serviceId?: string;
//   productId?: string;
// }) {
//   const project = await prisma.project.update({
//     where: { id: projectId },
//     data: { serviceId, productId },
//   });
//   return project;
// }

// export async function changeProjectChampion({
//   championId,
//   projectId,
// }: {
//   projectId: string;
//   championId: string;
// }) {
//   const project = await prisma.project.update({
//     where: { id: projectId },
//     data: { championId },
//   });
//   return project;
// }

// export async function getProjectsWithStatistic({
//   search,
// }: {
//   search?: string;
// }) {
//   const projects = await prisma.project.findMany({
//     where: {
//       OR: search
//         ? [
//             { name: { contains: search, mode: "insensitive" } },
//             { code: { contains: search, mode: "insensitive" } },
//           ]
//         : undefined,
//     },
//     include: {
//       projectClients: { include: { client: true } },
//       champion: { select: { id: true, name: true, photo: true } },
//       product: true,
//       service: true,
//       stages: {
//         select: {
//           id: true,
//           stageOrder: true,
//           name: true,
//           status: true,
//           milestones: {
//             select: {
//               id: true,
//               weight: true,
//               tasks: { select: { id: true, status: true } },
//             },
//           },
//         },
//       },
//     },
//   });
//   return projects;
// }
