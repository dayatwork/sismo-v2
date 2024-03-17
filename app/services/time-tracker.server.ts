import type { TrackerItem, Project, Task, TimeTracker } from "@prisma/client";
// import ShortUniqueId from "short-unique-id";

import prisma from "~/lib/prisma";
import redisClient from "~/lib/redis.server";

// =================
// ===== QUERY =====
// =================

type GetTimeTrackerOptions = {
  take?: number;
  skip?: number;
};

export async function getTimeTrackers({
  from,
  organizationId,
  to,
}: {
  organizationId: string;
  from: string | null;
  to: string | null;
}) {
  const take = !from || !to ? 20 : undefined;

  const trackers = await prisma.timeTracker.findMany({
    where: {
      organizationId,
      endAt: { not: null },
      startAt: { gte: from || undefined, lte: to || undefined },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
      trackerItems: {
        include: { task: true, attachments: true },
      },
    },
    take,
    orderBy: { startAt: "desc" },
  });

  return trackers;
}

export async function getUserTimeTrackers(
  organizationId: string,
  userId: string,
  options: GetTimeTrackerOptions = { skip: 0, take: 10 }
) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
  const { skip, take } = options;

  let trackers: (TimeTracker & {
    trackerItems: (TrackerItem & {
      task: Task & { project: Project | null };
      attachments: {
        id: string;
        displayName: string;
        url: string;
        type: "FILE" | "DOCUMENT" | "LINK";
      }[];
    })[];
  })[] = [];

  const trackersCache = await redisClient.get(cacheKey);

  if (trackersCache) {
    trackers = JSON.parse(trackersCache);
  } else {
    trackers = await prisma.timeTracker.findMany({
      where: {
        userId,
        organizationId,
      },
      orderBy: { startAt: "desc" },
      take,
      skip,
      include: {
        trackerItems: {
          include: { task: { include: { project: true } }, attachments: true },
        },
      },
    });
    redisClient.set(cacheKey, JSON.stringify(trackers), "EX", 60 * 5);
  }

  return trackers;
}

export async function getUserTimeTrackerById({
  trackerId,
  userId,
}: {
  userId: string;
  trackerId: string;
}) {
  const tracker = await prisma.timeTracker.findUnique({
    where: { id: trackerId, userId },
    include: {
      trackerItems: {
        include: {
          task: true,
          attachments: {
            select: { id: true, url: true, type: true, displayName: true },
          },
        },
      },
    },
  });
  return tracker;
}

export async function getTrackerItemById({ id }: { id: string }) {
  const trackerItem = await prisma.trackerItem.findUnique({
    where: { id },
    include: {
      task: true,
      attachments: {
        select: { id: true, url: true, type: true, displayName: true },
      },
    },
  });
  return trackerItem;
}

export async function getTotalInCompleteTrackers({
  organizationId,
  userId,
}: {
  userId: string;
  organizationId: string;
}) {
  const total = await prisma.timeTracker.count({
    where: { userId, organizationId, endAt: null },
  });
  return total;
}

export async function getPreviousTaskTracker({
  currentTrackerItemCompletion,
  currentTrackerItemId,
  taskId,
}: {
  taskId: string;
  currentTrackerItemCompletion: number;
  currentTrackerItemId: string;
}) {
  const previousTaskTracker = await prisma.trackerItem.findFirst({
    where: {
      taskId,
      taskCompletion: { lte: currentTrackerItemCompletion },
      id: { not: currentTrackerItemId },
    },
    orderBy: { taskCompletion: "desc" },
  });
  return previousTaskTracker;
}

export async function getUserTrackersInAYear({
  organizationId,
  userId,
  year,
}: {
  userId: string;
  organizationId: string;
  year: number;
}) {
  const trackers = await prisma.timeTracker.findMany({
    where: { organizationId, userId, year, endAt: { not: null } },
    select: { id: true, startAt: true, endAt: true, week: true, year: true },
  });
  return trackers;
}

export async function checkAllowClockIn({
  organizationId,
  totalLastTrackersToCheck = 10,
  userId,
}: {
  userId: string;
  organizationId: string;
  totalLastTrackersToCheck?: number;
}) {
  const timeTrackers = await getUserTimeTrackers(organizationId, userId);

  const trackersWithoutItem = timeTrackers.filter(
    (tracker) => tracker.trackerItems.length === 0
  );

  const allowClockIn = trackersWithoutItem.length === 0;

  return allowClockIn;
}

// ====================
// ===== MUTATION =====
// ====================

export async function clockin({
  organizationId,
  userId,
  week,
  year,
}: {
  organizationId: string;
  userId: string;
  week: number;
  year: number;
}) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
  await redisClient.del(cacheKey);

  return await prisma.$transaction(async (tx) => {
    // 1. Check is already have a running trackers
    const totalInCompleteTrackers = await tx.timeTracker.count({
      where: { userId, organizationId, endAt: null },
    });

    if (totalInCompleteTrackers > 0) {
      throw new Error("You already run a tracker");
    }

    const timeTracker = await tx.timeTracker.create({
      data: {
        userId,
        organizationId,
        week,
        year,
      },
    });

    return timeTracker;
  });
}

export async function clockout({
  trackerId,
  organizationId,
  userId,
}: {
  trackerId: string;
  userId: string;
  organizationId: string;
}) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
  await redisClient.del(cacheKey);

  return await prisma.$transaction(async (tx) => {
    const tracker = await tx.timeTracker.findUnique({
      where: { id: trackerId },
    });

    if (!tracker || tracker.endAt) {
      return null;
    }

    const timeTracker = await tx.timeTracker.update({
      where: { id: trackerId },
      data: { endAt: new Date() },
    });

    return timeTracker;
  });
}

export async function addTrackerItems({
  trackerItems,
  userId,
  organizationId,
}: {
  trackerItems: {
    timeTrackerId: string;
    taskId: string;
    taskCompletion: number;
    workDurationInMinutes: number;
    note?: string;
  }[];
  organizationId: string;
  userId: string;
}) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
  await redisClient.del(cacheKey);

  const items = await prisma.trackerItem.createMany({
    data: trackerItems,
  });
  return items;
}

export async function editTrackerItem({
  id,
  note,
  taskCompletion,
  taskId,
  workDurationInMinutes,
  organizationId,
  userId,
}: {
  id: string;
  taskId?: string;
  taskCompletion?: number;
  workDurationInMinutes?: number;
  note?: string;
  organizationId: string;
  userId: string;
}) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
  await redisClient.del(cacheKey);

  const trackerItem = await prisma.trackerItem.update({
    where: { id },
    data: { taskId, taskCompletion, workDurationInMinutes, note },
  });
  return trackerItem;
}

export async function deleteTrackerItem({
  id,
  organizationId,
  userId,
}: {
  id: string;
  organizationId: string;
  userId: string;
}) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
  await redisClient.del(cacheKey);

  const trackerItem = await prisma.trackerItem.delete({ where: { id } });
  return trackerItem;
}

export async function editTimeTracker({
  trackerId,
  endAt,
  startAt,
  organizationId,
  userId,
}: {
  trackerId: string;
  startAt?: string | Date;
  endAt?: string | Date;
  organizationId: string;
  userId: string;
}) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
  await redisClient.del(cacheKey);

  return await prisma.$transaction(async (tx) => {
    const tracker = await tx.timeTracker.findUnique({
      where: { id: trackerId },
    });

    if (!tracker) {
      return null;
    }

    const timeTracker = await tx.timeTracker.update({
      where: { id: trackerId },
      data: { startAt, endAt },
    });

    return timeTracker;
  });
}

export async function deleteTimeTracker({
  trackerId,
  userId,
  organizationId,
}: {
  userId: string;
  trackerId: string;
  organizationId: string;
}) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
  await redisClient.del(cacheKey);

  return await prisma.$transaction(async (tx) => {
    const foundTracker = await tx.timeTracker.findUnique({
      where: { id: trackerId, userId },
    });

    if (!foundTracker) return null;

    const timeTracker = await tx.timeTracker.delete({
      where: { id: trackerId },
    });

    return timeTracker;
  });
}

// export async function clockinWithNewTask({
//   organizationId,
//   taskDescription,
//   taskName,
//   userId,
//   week,
//   year,
// }: {
//   userId: string;
//   organizationId: string;
//   taskName: string;
//   taskDescription?: string;
//   week: number;
//   year: number;
// }) {
//   const cacheKey = `tracker:${organizationId}:${userId}`;
//   await redisClient.del(cacheKey);

//   return await prisma.$transaction(async (tx) => {
//     // 1. Check is already have a running trackers
//     const totalInCompleteTrackers = await tx.timeTracker.count({
//       where: { userId, organizationId, endAt: null },
//     });

//     if (totalInCompleteTrackers > 0) {
//       throw new Error("You already run a tracker");
//     }

//     const uid = new ShortUniqueId({ length: 10 });

//     const newTask = await tx.task.create({
//       data: {
//         code: uid.rnd(),
//         name: taskName,
//         description: taskDescription,
//         organizationId,
//         assigneeId: userId,
//         type: "PERSONAL",
//       },
//     });

//     await tx.timeTracker.create({
//       data: {
//         userId,
//         organizationId,
//         taskId: newTask.id,
//         taskCompletion: 0,
//         week,
//         year,
//       },
//     });

//     return null;
//   });
// }

// export async function clockinWithTask({
//   organizationId,
//   taskId,
//   userId,
//   week,
//   year,
// }: {
//   userId: string;
//   organizationId: string;
//   taskId: string;
//   week: number;
//   year: number;
// }) {
//   const cacheKey = `tracker:${organizationId}:${userId}`;
//   await redisClient.del(cacheKey);

//   await prisma.$transaction(async (tx) => {
//     // 1. Check is already have a running trackers
//     const totalInCompleteTrackers = await tx.timeTracker.count({
//       where: { userId, organizationId, endAt: null },
//     });

//     if (totalInCompleteTrackers > 0) {
//       throw new Error("You already run a tracker");
//     }

//     const task = await tx.task.findUnique({
//       where: { id: taskId },
//       include: { timeTrackers: { orderBy: { startAt: "desc" } } },
//     });

//     if (!task) {
//       throw new Error("Task not found");
//     }

//     if (["DONE", "CANCELED"].includes(task.status)) {
//       throw new Error("Task already finish");
//     }

//     await tx.timeTracker.create({
//       data: {
//         userId,
//         organizationId,
//         taskId,
//         week,
//         year,
//         taskCompletion: task.timeTrackers?.[0]
//           ? task.timeTrackers[0].taskCompletion
//           : 0,
//       },
//     });

//     await tx.task.update({
//       where: { id: taskId },
//       data: { status: "IN_PROGRESS" },
//     });

//     return null;
//   });
// }
