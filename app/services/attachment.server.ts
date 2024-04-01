import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import prisma from "~/lib/prisma";
import redisClient from "~/lib/redis.server";
import { s3Client } from "~/lib/s3.server";

export async function createTrackerAttachmentTypeLink({
  displayName,
  trackerItemId,
  url,
  ownerId,
  type = "LINK",
}: {
  trackerItemId: string;
  url: string;
  displayName: string;
  ownerId: string;
  type?: "DOCUMENT" | "LINK";
}) {
  const cacheKey = `task-tracker:${ownerId}`;
  await redisClient.del(cacheKey);

  const trackerItem = await prisma.taskTrackerItem.findUnique({
    where: { id: trackerItemId },
    include: { task: true },
  });

  if (!trackerItem) {
    throw new Error("Not found");
  }

  const attachment = await prisma.attachment.create({
    data: {
      type,
      taskId: trackerItem.taskId,
      trackerItemId: trackerItemId,
      url,
      displayName,
      ownerId,
    },
  });

  return attachment;
}

export async function createTrackerAttachmentTypeFile({
  displayName,
  trackerItemId,
  file,
  ownerId,
}: {
  trackerItemId: string;
  file: File;
  displayName?: string;
  ownerId: string;
}) {
  const cacheKey = `task-tracker:${ownerId}`;
  await redisClient.del(cacheKey);

  const trackerItem = await prisma.taskTrackerItem.findUnique({
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
      taskId: trackerItem.taskId,
      trackerItemId: trackerItemId,
      url,
      displayName: displayName || fileId,
      ownerId,
    },
  });

  return attachment;
}

export async function deleteAttachmentById({
  attachmentId,
  ownerId,
}: {
  attachmentId: string;
  ownerId: string;
}) {
  const cacheKey = `task-tracker:${ownerId}`;
  await redisClient.del(cacheKey);

  const attachment = await prisma.attachment.delete({
    where: { id: attachmentId },
  });
  return attachment;
}
