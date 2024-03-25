import ShortUniqueId from "short-unique-id";

import prisma from "~/lib/prisma";

// =========================
// ======== QUERIES ========
// =========================

export async function getUnfinishedTasks({
  assigneeId,
  excludeIds,
}: {
  assigneeId: string;
  excludeIds?: string[];
}) {
  const tasks = await prisma.task.findMany({
    where: {
      assigneeId,
      status: { in: ["BACKLOG", "TODO", "IN_PROGRESS"] },
      id: { notIn: excludeIds },
    },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return tasks;
}

export async function getTaskById({ id }: { id: string }) {
  const task = await prisma.task.findUnique({
    where: { id },
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
}: {
  assigneeId: string;
  taskId: string;
}) {
  const task = await prisma.task.findUnique({
    where: { id: taskId, assigneeId },
    include: {
      trackerItems: true,
      attachments: { include: { user: true } },
      milestone: true,
    },
  });
  return task;
}

export async function getStageTasks({
  stageId,
  milestoneId,
}: {
  stageId: string;
  milestoneId?: string;
}) {
  const tasks = await prisma.task.findMany({
    where: { stageId, milestoneId },
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
  description,
  dueDate,
}: {
  name: string;
  description?: string;
  assigneeId: string;
  dueDate?: string;
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
    },
  });
  return task;
}

export async function createStageTask({
  assigneeId,
  name,
  description,
  dueDate,
  stageId,
  milestoneId,
}: {
  stageId: string;
  name: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  milestoneId?: string;
}) {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
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
      type: "PROJECT",
      milestoneId,
    },
  });

  return task;
}

export async function editTask({
  id,
  description,
  dueDate,
  name,
}: {
  id: string;
  name?: string;
  description?: string;
  dueDate?: string | Date;
}) {
  const task = await prisma.task.update({
    where: { id },
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
  taskId,
}: {
  taskId: string;
  assigneeId: string;
}) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      assigneeId,
    },
  });
  return task;
}

export async function unassignTask({ taskId }: { taskId: string }) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      assigneeId: null,
    },
  });
  return task;
}

export async function cancelTask({ taskId }: { taskId: string }) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status: "CANCELED" },
  });
  return task;
}

export async function changeTaskDueDate({
  taskId,
  dueDate,
}: {
  taskId: string;
  dueDate?: string | Date;
}) {
  const task = await prisma.task.update({
    where: {
      id: taskId,
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

export async function deleteTask({ taskId }: { taskId: string }) {
  const task = await prisma.task.delete({
    where: { id: taskId },
  });
  return task;
}

export async function removeTaskDueDate({ taskId }: { taskId: string }) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { dueDate: null },
  });
  return task;
}
