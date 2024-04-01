import type { BoardTask, TaskTracker, TaskTrackerItem } from "@prisma/client";
import prisma from "~/lib/prisma";
import redisClient from "~/lib/redis.server";

// =================
// ===== QUERY =====
// =================
export async function getTaskTrackers({
  from,
  to,
}: {
  from: string | null;
  to: string | null;
}) {
  const take = !from || !to ? 20 : undefined;

  const trackers = await prisma.taskTracker.findMany({
    where: {
      endAt: { not: null },
      startAt: { gte: from || undefined, lte: to || undefined },
    },
    include: {
      owner: {
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

type GetTaskTrackerOptions = {
  take?: number;
  skip?: number;
};
export async function getTaskTrackersByOwnerId(
  ownerId: string,
  options: GetTaskTrackerOptions = { skip: 0, take: 10 }
) {
  const cacheKey = `task-tracker:${ownerId}`;
  const { skip, take } = options;

  let trackers: (TaskTracker & {
    trackerItems: (TaskTrackerItem & {
      task: BoardTask;
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
    trackers = await prisma.taskTracker.findMany({
      where: {
        ownerId,
      },
      orderBy: { startAt: "desc" },
      take,
      skip,
      include: {
        trackerItems: {
          include: { task: true, attachments: true },
        },
      },
    });
    redisClient.set(cacheKey, JSON.stringify(trackers), "EX", 60 * 5);
  }

  return trackers;
}

export async function getTaskTrackerByOwnerId({
  ownerId,
  trackerId,
}: {
  ownerId: string;
  trackerId: string;
}) {
  const tracker = await prisma.taskTracker.findUnique({
    where: { id: trackerId, ownerId },
    include: {
      trackerItems: {
        include: {
          task: true,
          attachments: {
            select: { id: true, url: true, displayName: true, type: true },
          },
        },
      },
    },
  });
  return tracker;
}

export async function getTaskTrackerItemById({ id }: { id: string }) {
  const trackerItem = await prisma.taskTrackerItem.findUnique({
    where: { id },
    include: {
      task: true,
      attachments: {
        select: {
          id: true,
          url: true,
          displayName: true,
          type: true,
        },
      },
    },
  });
  return trackerItem;
}

export async function getNumberOfInCompleteTrackers({
  ownerId,
}: {
  ownerId: string;
}) {
  const total = await prisma.taskTracker.count({
    where: { ownerId, endAt: null },
  });
  return total;
}

export async function getUserTrackersInAYear({
  ownerId,
  year,
}: {
  ownerId: string;
  year: number;
}) {
  const trackers = await prisma.taskTracker.findMany({
    where: {
      ownerId,
      year,
      endAt: { not: null },
    },
    select: { id: true, startAt: true, endAt: true, week: true, year: true },
  });
  return trackers;
}

export async function isUserAllowedClockedIn({
  userId,
  totalLastTrackersToCheck = 10,
}: {
  userId: string;
  totalLastTrackersToCheck?: number;
}) {
  const taskTrackers = await getTaskTrackersByOwnerId(userId, {
    take: totalLastTrackersToCheck,
  });

  const trackersWithoutItem = taskTrackers.filter(
    (tracker) => tracker.trackerItems.length === 0
  );

  const allowed = trackersWithoutItem.length === 0;
  return allowed;
}

export async function getPreviousTaskTrackerItem({
  currentTrackerItemCompletion,
  currentTrackerItemId,
  taskId,
}: {
  taskId: string;
  currentTrackerItemCompletion: number;
  currentTrackerItemId: string;
}) {
  const previousTaskTrackerItem = await prisma.taskTrackerItem.findFirst({
    where: {
      taskId,
      taskCompletion: { lte: currentTrackerItemCompletion },
      id: { not: currentTrackerItemId },
    },
    orderBy: { taskCompletion: "desc" },
  });
  return previousTaskTrackerItem;
}

// ====================
// ===== MUTATION =====
// ====================
export async function startTracker({
  ownerId,
  week,
  year,
}: {
  ownerId: string;
  week: number;
  year: number;
}) {
  const cacheKey = `task-tracker:${ownerId}`;
  await redisClient.del(cacheKey);

  return await prisma.$transaction(async (tx) => {
    const totalInCompleteTrackers = await tx.taskTracker.count({
      where: { ownerId, endAt: null },
    });

    if (totalInCompleteTrackers > 0) {
      throw new Error("You already run a tracker");
    }

    const taskTracker = await tx.taskTracker.create({
      data: {
        ownerId,
        week,
        year,
      },
    });

    return taskTracker;
  });
}

export async function stopTracker({
  ownerId,
  trackerId,
}: {
  trackerId: string;
  ownerId: string;
}) {
  const cacheKey = `task-tracker:${ownerId}`;
  await redisClient.del(cacheKey);

  return await prisma.$transaction(async (tx) => {
    const foundTaskTracker = await tx.taskTracker.findUnique({
      where: {
        id: trackerId,
      },
    });

    if (!foundTaskTracker || foundTaskTracker.endAt) {
      return null;
    }

    const taskTracker = await tx.taskTracker.update({
      where: { id: trackerId },
      data: { endAt: new Date() },
    });

    return taskTracker;
  });
}

export async function addTaskTrackerItems({
  ownerId,
  trackerItems,
}: {
  ownerId: string;
  trackerItems: {
    trackerId: string;
    taskId: string;
    taskCompletion: number;
    workDurationInMinutes: number;
    note?: string;
  }[];
}) {
  const cacheKey = `task-tracker:${ownerId}`;
  await redisClient.del(cacheKey);

  const items = await prisma.taskTrackerItem.createMany({ data: trackerItems });
  return items;
}

export async function editTaskTrackerItem({
  id,
  ownerId,
  note,
  taskCompletion,
  taskId,
  workDurationInMinutes,
}: {
  id: string;
  taskId?: string;
  taskCompletion?: number;
  workDurationInMinutes?: number;
  note?: string;
  ownerId: string;
}) {
  const cacheKey = `task-tracker:${ownerId}`;
  await redisClient.del(cacheKey);

  const trackerItem = await prisma.taskTrackerItem.update({
    where: { id },
    data: { taskId, taskCompletion, workDurationInMinutes, note },
  });
  return trackerItem;
}

export async function deleteTrackerItem({
  id,
  ownerId,
}: {
  id: string;
  ownerId: string;
}) {
  const cacheKey = `task-tracker:${ownerId}`;
  await redisClient.del(cacheKey);

  const trackerItem = await prisma.taskTrackerItem.delete({ where: { id } });
  return trackerItem;
}

export async function editTaskTracker({
  ownerId,
  trackerId,
  endAt,
  startAt,
}: {
  trackerId: string;
  startAt?: string | Date;
  endAt?: string | Date;
  ownerId: string;
}) {
  const cacheKey = `task-tracker:${ownerId}`;
  await redisClient.del(cacheKey);

  return await prisma.$transaction(async (tx) => {
    const foundTracker = await tx.taskTracker.findUnique({
      where: { id: trackerId },
    });

    if (!foundTracker) {
      return null;
    }

    const taskTracker = await tx.taskTracker.update({
      where: { id: trackerId },
      data: { startAt, endAt },
    });

    return taskTracker;
  });
}

export async function deleteTaskTracker({
  ownerId,
  trackerId,
}: {
  ownerId: string;
  trackerId: string;
}) {
  const cacheKey = `task-tracker:${ownerId}`;
  await redisClient.del(cacheKey);

  return await prisma.$transaction(async (tx) => {
    const foundTracker = await tx.taskTracker.findUnique({
      where: { id: trackerId, ownerId },
    });

    if (!foundTracker) return null;

    const taskTracker = await tx.taskTracker.delete({
      where: { id: trackerId },
    });

    return taskTracker;
  });
}
