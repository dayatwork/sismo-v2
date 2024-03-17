import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import prisma from "~/lib/prisma";
import redisClient from "~/lib/redis.server";
import { s3Client } from "~/lib/s3.server";

// =================
// ===== QUERY =====
// =================

export async function getProjectAttachments({
  organizationId,
  projectId,
}: {
  projectId: string;
  organizationId: string;
}) {
  const attachments = await prisma.attachment.findMany({
    where: {
      projectId,
      organizationId,
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

export async function getStageAttachments({
  organizationId,
  stageId,
}: {
  stageId: string;
  organizationId: string;
}) {
  const attachments = await prisma.attachment.findMany({
    where: {
      stageId,
      organizationId,
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
  organizationId,
  projectId,
  url,
  userId,
}: {
  projectId: string;
  url: string;
  displayName: string;
  userId: string;
  organizationId: string;
}) {
  const attachment = await prisma.attachment.create({
    data: {
      type: "LINK",
      projectId,
      url,
      displayName,
      userId,
      organizationId,
    },
  });
  return attachment;
}

export async function createProjectAttachmentTypeFile({
  displayName,
  organizationId,
  projectId,
  file,
  userId,
}: {
  projectId: string;
  file: File;
  displayName?: string;
  userId: string;
  organizationId: string;
}) {
  const fileId = uuid();
  const fileName = `${organizationId}/project/${projectId}/${fileId}.${file.name
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
      organizationId,
    },
  });

  return attachment;
}

export async function createStageAttachmentTypeLink({
  displayName,
  organizationId,
  stageId,
  url,
  userId,
}: {
  stageId: string;
  url: string;
  displayName: string;
  userId: string;
  organizationId: string;
}) {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId, organizationId },
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
      organizationId,
    },
  });

  return attachment;
}

export async function createStageAttachmentTypeFile({
  displayName,
  organizationId,
  stageId,
  file,
  userId,
}: {
  stageId: string;
  file: File;
  displayName?: string;
  userId: string;
  organizationId: string;
}) {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId, organizationId },
  });
  if (!stage) {
    throw new Error("Stage not found");
  }

  const fileId = uuid();
  const fileName = `${organizationId}/stage/${stageId}/${fileId}.${file.name
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
      organizationId,
    },
  });

  return attachment;
}

export async function createTaskAttachmentTypeLink({
  displayName,
  organizationId,
  taskId,
  url,
  userId,
}: {
  taskId: string;
  url: string;
  displayName: string;
  userId: string;
  organizationId: string;
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
      organizationId,
    },
  });

  return attachment;
}

export async function createTaskAttachmentTypeFile({
  displayName,
  organizationId,
  taskId,
  file,
  userId,
}: {
  taskId: string;
  file: File;
  displayName?: string;
  userId: string;
  organizationId: string;
}) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new Error("Task not found");
  }

  const fileId = uuid();
  const fileName = `${organizationId}/task/${taskId}/${fileId}.${file.name
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
      projectId: task.projectId,
      stageId: task.stageId,
      taskId,
      url,
      displayName: displayName || fileId,
      userId,
      organizationId,
    },
  });

  return attachment;
}

export async function createTrackerAttachmentTypeLink({
  displayName,
  organizationId,
  trackerItemId,
  url,
  userId,
  type = "LINK",
}: {
  trackerItemId: string;
  url: string;
  displayName: string;
  userId: string;
  organizationId: string;
  type?: "DOCUMENT" | "LINK";
}) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
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
      organizationId,
    },
  });

  return attachment;
}

export async function createTrackerAttachmentTypeFile({
  displayName,
  organizationId,
  trackerItemId,
  file,
  userId,
}: {
  trackerItemId: string;
  file: File;
  displayName?: string;
  userId: string;
  organizationId: string;
}) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
  await redisClient.del(cacheKey);

  const trackerItem = await prisma.trackerItem.findUnique({
    where: { id: trackerItemId },
    include: { task: true },
  });

  if (!trackerItem) {
    throw new Error("Not found");
  }

  const fileId = uuid();
  const fileName = `${organizationId}/task/${
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
      organizationId,
    },
  });

  return attachment;
}

export async function deleteAttachmentById({
  attachmentId,
  organizationId,
  userId,
}: {
  attachmentId: string;
  organizationId: string;
  userId: string;
}) {
  const cacheKey = `tracker:${organizationId}:${userId}`;
  await redisClient.del(cacheKey);

  const attachment = await prisma.attachment.delete({
    where: { id: attachmentId, organizationId },
  });
  return attachment;
}
