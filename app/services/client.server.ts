import prisma from "~/lib/prisma";

export async function getClients({
  organizationId,
}: {
  organizationId: string;
}) {
  const clients = await prisma.client.findMany({ where: { organizationId } });
  return clients;
}

export async function addNewClient({
  name,
  code,
  organizationId,
}: {
  name: string;
  code: string;
  organizationId: string;
}) {
  const client = await prisma.client.create({
    data: {
      name,
      code,
      organizationId,
    },
  });
  return client;
}
