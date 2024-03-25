import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import prisma from "~/lib/prisma";
import redisClient from "~/lib/redis.server";
import { s3Client } from "~/lib/s3.server";

// =================
// ===== QUERY =====
// =================

export async function getProjectAttachments({
  projectId,
}: {
  projectId: string;
}) {
  const attachments = await prisma.attachment.findMany({
    where: {
      projectId,
      stageId: null,
      taskId: null,
      trackerItemId: null,
    },
    include: {
      user: true,
    },
  });
  return attachments;
}

export async function getStageAttachments({ stageId }: { stageId: string }) {
  const attachments = await prisma.attachment.findMany({
    where: {
      stageId,
      taskId: null,
      trackerItemId: null,
    },
    include: {
      user: true,
    },
  });
  return attachments;
}

// ====================
// ===== MUTATION =====
// ====================

export async function createProjectAttachmentTypeLink({
  displayName,
  projectId,
  url,
  userId,
}: {
  projectId: string;
  url: string;
  displayName: string;
  userId: string;
}) {
  const attachment = await prisma.attachment.create({
    data: {
      type: "LINK",
      projectId,
      url,
      displayName,
      userId,
    },
  });
  return attachment;
}

export async function createProjectAttachmentTypeFile({
  displayName,
  projectId,
  file,
  userId,
}: {
  projectId: string;
  file: File;
  displayName?: string;
  userId: string;
}) {
  const fileId = uuid();
  const fileName = `project/${projectId}/${fileId}.${file.name
    .split(".")
    .slice(-1)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    ACL: "public-read",
  });

  await s3Client.send(command);

  const url = `${process.env.S3_END_POINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;

  const attachment = await prisma.attachment.create({
    data: {
      type: "FILE",
      projectId,
      url,
      displayName: displayName || fileId,
      userId,
    },
  });

  return attachment;
}

export async function createStageAttachmentTypeLink({
  displayName,
  stageId,
  url,
  userId,
}: {
  stageId: string;
  url: string;
  displayName: string;
  userId: string;
}) {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
  });
  if (!stage) {
    throw new Error("Stage not found");
  }

  const attachment = await prisma.attachment.create({
    data: {
      type: "LINK",
      projectId: stage.projectId,
      stageId,
      url,
      displayName,
      userId,
    },
  });

  return attachment;
}

export async function createStageAttachmentTypeFile({
  displayName,
  stageId,
  file,
  userId,
}: {
  stageId: string;
  file: File;
  displayName?: string;
  userId: string;
}) {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
  });
  if (!stage) {
    throw new Error("Stage not found");
  }

  const fileId = uuid();
  const fileName = `stage/${stageId}/${fileId}.${file.name
    .split(".")
    .slice(-1)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    ACL: "public-read",
  });

  await s3Client.send(command);

  const url = `${process.env.S3_END_POINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;

  const attachment = await prisma.attachment.create({
    data: {
      type: "FILE",
      projectId: stage.projectId,
      stageId,
      url,
      displayName: displayName || fileId,
      userId,
    },
  });

  return attachment;
}

export async function createTaskAttachmentTypeLink({
  displayName,
  taskId,
  url,
  userId,
}: {
  taskId: string;
  url: string;
  displayName: string;
  userId: string;
}) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new Error("Task not found");
  }

  const attachment = await prisma.attachment.create({
    data: {
      type: "LINK",
      projectId: task.projectId,
      stageId: task.stageId,
      taskId,
      url,
      displayName,
      userId,
    },
  });

  return attachment;
}

export async function createTaskAttachmentTypeFile({
  displayName,
  taskId,
  file,
  userId,
}: {
  taskId: string;
  file: File;
  displayName?: string;
  userId: string;
}) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new Error("Task not found");
  }

  const fileId = uuid();
  const fileName = `task/${taskId}/${fileId}.${file.name.split(".").slice(-1)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    ACL: "public-read",
  });

  await s3Client.send(command);

  const url = `${process.env.S3_END_POINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;

  const attachment = await prisma.attachment.create({
    data: {
      type: "FILE",
      projectId: task.projectId,
      stageId: task.stageId,
      taskId,
      url,
      displayName: displayName || fileId,
      userId,
    },
  });

  return attachment;
}

export async function createTrackerAttachmentTypeLink({
  displayName,
  trackerItemId,
  url,
  userId,
  type = "LINK",
}: {
  trackerItemId: string;
  url: string;
  displayName: string;
  userId: string;
  type?: "DOCUMENT" | "LINK";
}) {
  const cacheKey = `tracker:${userId}`;
  await redisClient.del(cacheKey);

  const trackerItem = await prisma.trackerItem.findUnique({
    where: { id: trackerItemId },
    include: { task: true },
  });

  if (!trackerItem) {
    throw new Error("Not found");
  }

  const attachment = await prisma.attachment.create({
    data: {
      type,
      projectId: trackerItem?.task.projectId,
      stageId: trackerItem?.task.stageId,
      taskId: trackerItem.taskId,
      trackerItemId: trackerItemId,
      url,
      displayName,
      userId,
    },
  });

  return attachment;
}

export async function createTrackerAttachmentTypeFile({
  displayName,
  trackerItemId,
  file,
  userId,
}: {
  trackerItemId: string;
  file: File;
  displayName?: string;
  userId: string;
}) {
  const cacheKey = `tracker:${userId}`;
  await redisClient.del(cacheKey);

  const trackerItem = await prisma.trackerItem.findUnique({
    where: { id: trackerItemId },
    include: { task: true },
  });

  if (!trackerItem) {
    throw new Error("Not found");
  }

  const fileId = uuid();
  const fileName = `task/${
    trackerItem.taskId
  }/tracker/${trackerItemId}/${fileId}.${file.name.split(".").slice(-1)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    ACL: "public-read",
  });

  await s3Client.send(command);

  const url = `${process.env.S3_END_POINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;

  const attachment = await prisma.attachment.create({
    data: {
      type: "FILE",
      projectId: trackerItem?.task.projectId,
      stageId: trackerItem?.task.stageId,
      taskId: trackerItem.taskId,
      trackerItemId: trackerItemId,
      url,
      displayName: displayName || fileId,
      userId,
    },
  });

  return attachment;
}

export async function deleteAttachmentById({
  attachmentId,
  userId,
}: {
  attachmentId: string;
  userId: string;
}) {
  const cacheKey = `tracker:${userId}`;
  await redisClient.del(cacheKey);

  const attachment = await prisma.attachment.delete({
    where: { id: attachmentId },
  });
  return attachment;
}
