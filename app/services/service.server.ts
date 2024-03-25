import prisma from "~/lib/prisma";

export async function getServices() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });
  return services;
}

export async function getServiceById({ serviceId }: { serviceId: string }) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });
  return service;
}

export async function createService({
  code,
  name,
  description,
}: {
  name: string;
  code: string;
  description?: string;
}) {
  const service = await prisma.service.create({
    data: { code, name, description },
  });
  return service;
}

export async function editService({
  code,
  name,
  description,
  serviceId,
}: {
  name?: string;
  code?: string;
  description?: string;
  serviceId: string;
}) {
  const service = await prisma.service.update({
    where: { id: serviceId },
    data: { code, name, description },
  });
  return service;
}

export async function deleteService({ serviceId }: { serviceId: string }) {
  const service = await prisma.service.delete({
    where: { id: serviceId },
  });
  return service;
}
