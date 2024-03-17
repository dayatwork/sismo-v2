import prisma from "~/lib/prisma";

export async function getSuperAdminDashboardData() {
  const [totalOrganizations, totalUsers] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
  ]);

  return { totalOrganizations, totalUsers };
}
