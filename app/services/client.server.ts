import prisma from "~/lib/prisma";

export async function getClients() {
  const clients = await prisma.client.findMany();
  return clients;
}

export async function addNewClient({
  name,
  code,
}: {
  name: string;
  code: string;
}) {
  const client = await prisma.client.create({
    data: {
      name,
      code,
    },
  });
  return client;
}
