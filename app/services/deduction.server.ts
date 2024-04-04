import prisma from "~/lib/prisma";

export async function getDeductions() {
  const deductions = await prisma.deduction.findMany({
    include: {
      user: { select: { id: true, name: true, photo: true } },
      name: true,
    },
  });
  return deductions;
}
