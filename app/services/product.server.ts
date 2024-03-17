import prisma from "~/lib/prisma";

export async function getProducts({
  organizationId,
}: {
  organizationId: string;
}) {
  const products = await prisma.product.findMany({
    where: { organizationId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: { subProducts: { select: { id: true, name: true, code: true } } },
  });
  return products;
}

export async function getSubProducts({
  organizationId,
  parentId,
}: {
  organizationId: string;
  parentId: string;
}) {
  const products = await prisma.product.findMany({
    where: { organizationId, parentId },
    orderBy: { createdAt: "asc" },
  });
  return products;
}

export async function getProductById({
  organizationId,
  productId,
}: {
  organizationId: string;
  productId: string;
}) {
  const product = await prisma.product.findUnique({
    where: { organizationId, id: productId },
  });
  return product;
}

export async function createProduct({
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
  const product = await prisma.product.create({
    data: { code, name, organizationId, description },
  });
  return product;
}

export async function createSubProduct({
  code,
  name,
  description,
  organizationId,
  parentId,
}: {
  name: string;
  code: string;
  description?: string;
  organizationId: string;
  parentId: string;
}) {
  const product = await prisma.product.create({
    data: { code, name, organizationId, description, parentId },
  });
  return product;
}

export async function editProduct({
  code,
  name,
  description,
  organizationId,
  productId,
}: {
  name?: string;
  code?: string;
  description?: string;
  organizationId: string;
  productId: string;
}) {
  const product = await prisma.product.update({
    where: { id: productId, organizationId },
    data: { code, name, description },
  });
  return product;
}

export async function deleteProduct({
  organizationId,
  productId,
}: {
  productId: string;
  organizationId: string;
}) {
  const product = await prisma.product.delete({
    where: { id: productId, organizationId },
  });
  return product;
}
