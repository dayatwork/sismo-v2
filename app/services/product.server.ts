import prisma from "~/lib/prisma";

export async function getProducts() {
  const products = await prisma.product.findMany({
    where: { parentId: null },
    orderBy: { createdAt: "asc" },
    include: { subProducts: { select: { id: true, name: true, code: true } } },
  });
  return products;
}

export async function getSubProducts({ parentId }: { parentId: string }) {
  const products = await prisma.product.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
  });
  return products;
}

export async function getProductById({ productId }: { productId: string }) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  return product;
}

export async function createProduct({
  code,
  name,
  description,
}: {
  name: string;
  code: string;
  description?: string;
}) {
  const product = await prisma.product.create({
    data: { code, name, description },
  });
  return product;
}

export async function createSubProduct({
  code,
  name,
  description,
  parentId,
}: {
  name: string;
  code: string;
  description?: string;
  parentId: string;
}) {
  const product = await prisma.product.create({
    data: { code, name, description, parentId },
  });
  return product;
}

export async function editProduct({
  code,
  name,
  description,
  productId,
}: {
  name?: string;
  code?: string;
  description?: string;
  productId: string;
}) {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { code, name, description },
  });
  return product;
}

export async function deleteProduct({ productId }: { productId: string }) {
  const product = await prisma.product.delete({
    where: { id: productId },
  });
  return product;
}
