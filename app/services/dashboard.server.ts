// import prisma from "~/lib/prisma";

// export async function getOrganizationUsersForDashboard() {
//   const organizationUsers = await prisma.organizationUser.findMany({
//     where: { organizationId },
//     include: {
//       user: {
//         include: {
//           timeTrackers: { where: { endAt: null } },
//         },
//       },
//     },
//   });
//   return organizationUsers;
// }

// export async function getDashboardData({
//   organizationId,
// }: {
//   organizationId: string;
// }) {
//   const totalUserQuery = prisma.organizationUser.findMany({
//     where: { organizationId },
//   });
//   const totalProjectQuery = prisma.project.findMany({
//     where: { organizationId },
//   });
// }
