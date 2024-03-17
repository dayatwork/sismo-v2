import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

import prisma from "~/lib/prisma";
import { s3Client } from "~/lib/s3.server";

type DocumentCoverLinkProps = {
  organizationId: string;
  userId: string;
  id: string;
  type: "link";
  url: string;
};

type DocumentCoverFileProps = {
  organizationId: string;
  userId: string;
  id: string;
  type: "file";
  file: File;
};

export async function updateDocumentCover(
  props: DocumentCoverLinkProps | DocumentCoverFileProps
) {
  if (props.type === "file") {
    const { file, id, organizationId, userId } = props;
    const fileId = uuid();
    const fileName = `${organizationId}/document/${userId}/${id}/${fileId}.${file.name
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

    const document = await prisma.document.update({
      where: { id, userId },
      data: { coverImage: url },
    });

    return document;
  } else {
    const { id, url, userId } = props;

    const document = await prisma.document.update({
      where: { id, userId },
      data: { coverImage: url },
    });

    return document;
  }
}

export async function uploadDocumentImage(props: {
  organizationId: string;
  userId: string;
  id: string;
  file: File;
}) {
  const { file, id, organizationId, userId } = props;
  const fileId = uuid();
  const fileName = `${organizationId}/document/${userId}/${id}/${fileId}.${file.name
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

  return { url };
}

export async function getUserDocumentById({
  documentId,
  organizationId,
  userId,
  onlyIdAndTitle = false,
}: {
  documentId: string;
  organizationId: string;
  userId: string;
  onlyIdAndTitle?: boolean;
}) {
  const document = await prisma.document.findUnique({
    where: { organizationId, id: documentId, userId },
    select: onlyIdAndTitle ? { id: true, title: true } : undefined,
  });
  return document;
}

export async function getUserDocuments({
  organizationId,
  userId,
  isPublished,
}: {
  userId: string;
  organizationId: string;
  isPublished?: boolean;
}) {
  const documents = await prisma.document.findMany({
    where: { userId, organizationId, isPublished },
    orderBy: { createdAt: "asc" },
  });
  return documents;
}

export async function getPublicDocumentById({
  documentId,
}: {
  documentId: string;
}) {
  const document = await prisma.document.findUnique({
    where: { id: documentId, isPublished: true },
  });
  return document;
}

export async function deleteUserDocumentById({
  documentId,
  userId,
}: {
  documentId: string;
  userId: string;
}) {
  const document = await prisma.document.delete({
    where: { id: documentId, userId },
  });
  return document;
}

export async function updateUserDocumentById({
  documentId,
  userId,
  content,
  icon,
  isPublished,
  title,
}: {
  documentId: string;
  userId: string;
  title?: string;
  content?: string;
  isPublished?: boolean;
  icon?: string;
}) {
  const document = await prisma.document.update({
    where: { id: documentId, userId },
    data: { title, content, icon, isPublished },
  });
  return document;
}

export async function createDocument({
  organizationId,
  userId,
}: {
  userId: string;
  organizationId: string;
}) {
  const document = await prisma.document.create({
    data: { organizationId, userId },
  });
  return document;
}
