import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

import { s3Client } from "~/lib/s3.server";
import prisma from "~/lib/prisma";

// =========================
// ======== QUERIES ========
// =========================
export async function getInboxMailCount({
  receiverId,
}: {
  receiverId: string;
}) {
  const inboxMailCount = await prisma.mail.count({
    where: {
      status: "SENT",
      receiverId,
    },
  });
  return inboxMailCount;
}

export async function getSentMailCount({ senderId }: { senderId: string }) {
  const sentMailCount = await prisma.mail.count({
    where: {
      status: "SENT",
      senderId,
    },
  });
  return sentMailCount;
}

export async function getDraftMailCount({ senderId }: { senderId: string }) {
  const draftMailCount = await prisma.mail.count({
    where: {
      status: "DRAFT",
      senderId,
    },
  });
  return draftMailCount;
}

export async function getInboxMails({ receiverId }: { receiverId: string }) {
  const inboxMails = await prisma.mail.findMany({
    where: {
      status: "SENT",
      receiverId,
    },
    include: { sender: true, parent: true },
    orderBy: { createdAt: "desc" },
  });
  return inboxMails;
}

export async function getInboxMailById({ id }: { id: string }) {
  let inbox = await prisma.mail.findUnique({
    where: { id },
    include: {
      sender: true,
      receiver: true,
      children: { include: { sender: true, receiver: true } },
      attachments: true,
    },
  });
  if (inbox?.parentId) {
    inbox = await prisma.mail.findUnique({
      where: { id: inbox.parentId },
      include: {
        sender: true,
        receiver: true,
        children: { include: { sender: true, receiver: true } },
        attachments: true,
      },
    });
  }
  return inbox;
}

export async function getSentMails({ senderId }: { senderId: string }) {
  const sentMails = await prisma.mail.findMany({
    where: {
      status: "SENT",
      senderId,
    },
    include: {
      receiver: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return sentMails;
}

export async function getDraftMails({ senderId }: { senderId: string }) {
  const draftMails = await prisma.mail.findMany({
    where: {
      status: "DRAFT",
      senderId,
    },
    include: {
      receiver: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return draftMails;
}

export async function getMailById({ id }: { id: string }) {
  const mail = await prisma.mail.findUnique({ where: { id } });
  return mail;
}

// ===========================
// ======== MUTATIONS ========
// ===========================
export async function createMail({
  body,
  code,
  receiverId,
  senderId,
  parentId,
}: {
  code: string;
  body: string;
  parentId?: string;
  senderId: string;
  receiverId: string | null;
}) {
  const mail = await prisma.mail.create({
    data: {
      code,
      body,
      parentId,
      senderId,
      receiverId,
      sentAt: new Date(),
      status: "SENT",
    },
  });
  return mail;
}

export async function createMailForManyReceivers({
  body,
  code,
  receiverIds,
  senderId,
  subject,
  attachments,
}: {
  code: string;
  body: string;
  parentId?: string;
  senderId: string;
  receiverIds: string[];
  subject: string;
  attachments?: File[];
}) {
  let attachmentUrls: string[] | undefined;

  if (attachments) {
    const filesInfo = attachments.map((attachment) => {
      const fileId = uuid();
      const fileName = `mail-attachments/${fileId}.${attachment.name
        .split(".")
        .slice(-1)}`;

      return {
        file: attachment,
        fileId,
        fileName,
        url: `${process.env.S3_END_POINT}/${process.env.S3_BUCKET_NAME}/${fileName}`,
      };
    });

    await Promise.all(
      filesInfo.map(async (fileInfo) => {
        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileInfo.fileName,
          Body: Buffer.from(await fileInfo.file.arrayBuffer()),
          ContentType: fileInfo.file.type,
          ACL: "public-read",
        });

        return s3Client.send(command);
      })
    );

    attachmentUrls = filesInfo.map((fileInfo) => fileInfo.url);
  }

  return await prisma.$transaction(async (tx) => {
    const mails = await tx.mail.createMany({
      data: receiverIds.map((receiverId) => ({
        code,
        body,
        sentAt: new Date(),
        status: "SENT",
        subject,
        senderId,
        receiverId,
      })),
    });

    if (attachmentUrls) {
      const foundMails = await tx.mail.findMany({ where: { code } });

      const attachmentsPayload = foundMails.flatMap((foundMail) =>
        attachmentUrls!.map((url) => ({ mailId: foundMail.id, url }))
      );

      await tx.mailAttachment.createMany({ data: attachmentsPayload });
    }

    return mails;
  });
}
