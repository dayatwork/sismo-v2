import ShortUniqueId from "short-unique-id";

import prisma from "~/lib/prisma";

// =========================
// ======== QUERIES ========
// =========================

export async function getUnfinishedTasks({
  assigneeId,
  organizationId,
  excludeIds,
}: {
  assigneeId: string;
  organizationId: string;
  excludeIds?: string[];
}) {
  const tasks = await prisma.task.findMany({
    where: {
      assigneeId,
      organizationId,
      status: { in: ["BACKLOG", "TODO", "IN_PROGRESS"] },
      id: { notIn: excludeIds },
    },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return tasks;
}

export async function getTaskById({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  const task = await prisma.task.findUnique({
    where: { id, organizationId },
    include: {
      assignee: true,
      attachments: { include: { user: true } },
      trackerItems: { orderBy: { createdAt: "desc" } },
      milestone: true,
    },
  });
  return task;
}

type GetAssigneeTasksProps = {
  assigneeId: string;
  organizationId: string;
  taskNameOrCode?: string;
  stageId?: string;
  status?: {
    in: ("BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED")[];
  };
  pageSize?: number;
  skip?: number;
  sort?: string;
};

export async function getAssigneeTasks({
  assigneeId,
  organizationId,
  pageSize,
  skip,
  sort,
  stageId,
  status,
  taskNameOrCode,
}: GetAssigneeTasksProps) {
  const [tasks, totalTasks] = await Promise.all([
    prisma.task.findMany({
      where: {
        assigneeId,
        organizationId,
        OR: taskNameOrCode
          ? [
              {
                name: { contains: taskNameOrCode, mode: "insensitive" },
              },
              { code: { contains: taskNameOrCode, mode: "insensitive" } },
            ]
          : undefined,
        stageId:
          stageId === "all"
            ? undefined
            : stageId === "all-project"
            ? { not: null }
            : stageId === "null"
            ? { equals: null }
            : stageId,
        status,
      },
      take: pageSize,
      skip,
      include: {
        stage: { include: { project: { select: { id: true, name: true } } } },
        milestone: true,
      },
      orderBy:
        sort === "latest"
          ? { createdAt: "desc" }
          : sort === "oldest"
          ? { createdAt: "asc" }
          : sort === "duedate-desc"
          ? { dueDate: "desc" }
          : sort === "duedate-asc"
          ? { dueDate: "asc" }
          : { createdAt: "desc" },
    }),
    prisma.task.count({
      where: {
        assigneeId,
        organizationId,
        OR: taskNameOrCode
          ? [
              {
                name: { contains: taskNameOrCode, mode: "insensitive" },
              },
              { code: { contains: taskNameOrCode, mode: "insensitive" } },
            ]
          : undefined,
        stageId:
          stageId === "all"
            ? undefined
            : stageId === "null"
            ? { equals: null }
            : stageId,
        status,
      },
    }),
  ]);
  return { tasks, totalTasks };
}

export async function getAssigneeTaskById({
  assigneeId,
  taskId,
  organizationId,
}: {
  assigneeId: string;
  taskId: string;
  organizationId: string;
}) {
  const task = await prisma.task.findUnique({
    where: { id: taskId, assigneeId, organizationId },
    include: {
      trackerItems: true,
      attachments: { include: { user: true } },
      milestone: true,
    },
  });
  return task;
}

export async function getStageTasks({
  organizationId,
  stageId,
  milestoneId,
}: {
  stageId: string;
  organizationId: string;
  milestoneId?: string;
}) {
  const tasks = await prisma.task.findMany({
    where: { stageId, organizationId, milestoneId },
    include: { assignee: true, milestone: true },
    orderBy: { createdAt: "desc" },
  });
  return tasks;
}

// =========================
// ======= MUTATIONS =======
// =========================

export async function createPersonalTask({
  assigneeId,
  name,
  organizationId,
  description,
  dueDate,
}: {
  name: string;
  description?: string;
  assigneeId: string;
  dueDate?: string;
  organizationId: string;
}) {
  const uid = new ShortUniqueId({ length: 10 });

  const task = await prisma.task.create({
    data: {
      code: uid.rnd(),
      name,
      description,
      assigneeId,
      type: "PERSONAL",
      dueDate,
      organizationId,
    },
  });
  return task;
}

export async function createStageTask({
  assigneeId,
  name,
  organizationId,
  description,
  dueDate,
  stageId,
  milestoneId,
}: {
  organizationId: string;
  stageId: string;
  name: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  milestoneId?: string;
}) {
  const stage = await prisma.stage.findUnique({
    where: { organizationId, id: stageId },
  });
  if (!stage) {
    throw new Error("Stage not found");
  }

  const uid = new ShortUniqueId({ length: 10 });

  const task = await prisma.task.create({
    data: {
      code: uid.rnd(),
      name,
      assigneeId,
      dueDate,
      projectId: stage.projectId,
      stageId,
      description,
      organizationId,
      type: "PROJECT",
      milestoneId,
    },
  });

  return task;
}

export async function editTask({
  id,
  organizationId,
  description,
  dueDate,
  name,
}: {
  id: string;
  organizationId: string;
  name?: string;
  description?: string;
  dueDate?: string;
}) {
  const task = await prisma.task.update({
    where: { id, organizationId },
    data: {
      name,
      description,
      dueDate,
    },
  });
  return task;
}

export async function assignTask({
  assigneeId,
  organizationId,
  taskId,
}: {
  taskId: string;
  organizationId: string;
  assigneeId: string;
}) {
  const task = await prisma.task.update({
    where: { id: taskId, organizationId },
    data: {
      assigneeId,
    },
  });
  return task;
}

export async function unassignTask({
  organizationId,
  taskId,
}: {
  taskId: string;
  organizationId: string;
}) {
  const task = await prisma.task.update({
    where: { id: taskId, organizationId },
    data: {
      assigneeId: null,
    },
  });
  return task;
}

export async function cancelTask({
  organizationId,
  taskId,
}: {
  taskId: string;
  organizationId: string;
}) {
  const task = await prisma.task.update({
    where: { id: taskId, organizationId },
    data: { status: "CANCELED" },
  });
  return task;
}

export async function changeTaskDueDate({
  organizationId,
  taskId,
  dueDate,
}: {
  taskId: string;
  organizationId: string;
  dueDate?: string;
}) {
  const task = await prisma.task.update({
    where: {
      id: taskId,
      organizationId,
    },
    data: {
      dueDate,
    },
  });
  return task;
}

export async function deleteTaskById({ id }: { id: string }) {
  const task = await prisma.task.delete({ where: { id } });
  return task;
}

export async function deleteTask({
  organizationId,
  taskId,
}: {
  taskId: string;
  organizationId: string;
}) {
  const task = await prisma.task.delete({
    where: { id: taskId, organizationId },
  });
  return task;
}

export async function removeTaskDueDate({
  organizationId,
  taskId,
}: {
  taskId: string;
  organizationId: string;
}) {
  const task = await prisma.task.update({
    where: { id: taskId, organizationId },
    data: { dueDate: null },
  });
  return task;
}
