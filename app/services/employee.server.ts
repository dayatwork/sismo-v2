import prisma from "~/lib/prisma";

export async function createEmployeePosition({
  divisionId,
  jobLevelId,
  organizationId,
  userId,
}: {
  divisionId: string;
  jobLevelId: string;
  userId: string;
  organizationId: string;
}) {
  const employeePosition = await prisma.employeePosition.create({
    data: { divisionId, jobLevelId, userId, organizationId },
  });
  return employeePosition;
}
