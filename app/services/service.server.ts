import prisma from "~/lib/prisma";

export async function getServices({
  organizationId,
}: {
  organizationId: string;
}) {
  const services = await prisma.service.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
  return services;
}

export async function getServiceById({
  organizationId,
  serviceId,
}: {
  organizationId: string;
  serviceId: string;
}) {
  const service = await prisma.service.findUnique({
    where: { organizationId, id: serviceId },
  });
  return service;
}

export async function createService({
  code,
  name,
  description,
  organizationId,
}: {
  name: string;
  code: string;
  description?: string;
  organizationId: string;
}) {
  const service = await prisma.service.create({
    data: { code, name, organizationId, description },
  });
  return service;
}

export async function editService({
  code,
  name,
  description,
  organizationId,
  serviceId,
}: {
  name?: string;
  code?: string;
  description?: string;
  organizationId: string;
  serviceId: string;
}) {
  const service = await prisma.service.update({
    where: { id: serviceId, organizationId },
    data: { code, name, description },
  });
  return service;
}

export async function deleteService({
  organizationId,
  serviceId,
}: {
  serviceId: string;
  organizationId: string;
}) {
  const service = await prisma.service.delete({
    where: { id: serviceId, organizationId },
  });
  return service;
}
