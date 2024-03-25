import prisma from "~/lib/prisma";

export async function getSuperAdminDashboardData() {
  const totalUsers = await prisma.user.count();

  return { totalUsers };
}
