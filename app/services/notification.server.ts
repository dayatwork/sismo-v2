import prisma from "~/lib/prisma";

export async function createNotification({
  link,
  receiverId,
  title,
  description,
  thumbnail,
  type,
}: {
  title: string;
  receiverId: string;
  link: string;
  description?: string;
  type?: string;
  thumbnail?: string;
}) {
  const notification = await prisma.notification.create({
    data: { link, title, receiverId, description, type, thumbnail },
  });
  return notification;
}

export async function createNotificationForManyUsers({
  link,
  receiverIds,
  title,
  description,
  thumbnail,
  type,
}: {
  title: string;
  receiverIds: string[];
  link: string;
  description?: string;
  type?: string;
  thumbnail?: string;
}) {
  const data = receiverIds.map((receiverId) => ({
    link,
    title,
    receiverId,
    description,
    type,
    thumbnail,
  }));
  const notification = await prisma.notification.createMany({ data: data });
  return notification;
}

export async function broadcastNotification({
  link,
  title,
  description,
  thumbnail,
  type,
}: {
  title: string;
  link: string;
  description?: string;
  type?: string;
  thumbnail?: string;
}) {
  const notification = await prisma.notification.create({
    data: { link, title, description, type, thumbnail, isBroadcast: true },
  });
  return notification;
}

export async function readNotification({
  notificationId,
}: {
  notificationId: string;
}) {
  const notification = await prisma.notification.update({
    where: { id: notificationId, isBroadcast: false },
    data: { read: true },
  });
  return notification;
}

export async function readUserNotifications({ userId }: { userId: string }) {
  const notifications = await prisma.notification.updateMany({
    where: { receiverId: userId, read: false },
    data: { read: true },
  });
  return notifications;
}

export async function deleteNotification({
  notificationId,
}: {
  notificationId: string;
}) {
  const notification = await prisma.notification.delete({
    where: { id: notificationId, isBroadcast: false },
  });
  return notification;
}

export async function deleteNotifications({
  notificationIds,
  includeBroadcast,
}: {
  notificationIds: string[];
  includeBroadcast?: boolean;
}) {
  const notification = await prisma.notification.deleteMany({
    where: {
      id: { in: notificationIds },
      isBroadcast: includeBroadcast ? undefined : false,
    },
  });
  return notification;
}

export async function getUserNotifications({
  userId,
  all,
}: {
  userId: string;
  all?: boolean;
}) {
  const notifications = await prisma.notification.findMany({
    where: { receiverId: userId, read: all ? undefined : false },
  });
  return notifications;
}
