import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { s3Client } from "~/lib/s3.server";
import prisma from "~/lib/prisma";

// =========================
// ======== QUERIES ========
// =========================
export async function getUserConversations({ userId }: { userId: string }) {
  const conversations = await prisma.conversation.findMany({
    where: { users: { some: { id: userId } } },
    include: { users: true },
  });
  return conversations;
}

export async function getConversation({
  conversationId,
}: {
  conversationId: string;
}) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { users: true, messages: true },
  });
  return conversation;
}

// ===========================
// ======== MUTATIONS ========
// ===========================
export async function createConversation({
  createdById,
  isGroup,
  userIds,
}: {
  isGroup: boolean;
  userIds: string[];
  createdById: string;
}) {
  const conversation = await prisma.conversation.create({
    data: {
      isGroup,
      users: { connect: userIds.map((id) => ({ id })) },
      createdById,
    },
    include: { users: true },
  });
  return conversation;
}

export async function createMessage({
  body,
  conversationId,
  senderId,
  file,
}: {
  conversationId: string;
  senderId: string;
  body: string;
  file?: File;
}) {
  let fileUrl: string | undefined;

  if (file) {
    const fileId = uuid();
    const fileName = `chat/${conversationId}/${fileId}.${file.name
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

    fileUrl = `${process.env.S3_END_POINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;
  }

  const message = await prisma.message.create({
    data: { body, conversationId, senderId, fileUrl },
  });
  return message;
}
