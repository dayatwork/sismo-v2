import ShortUniqueId from "short-unique-id";
import prisma from "~/lib/prisma";

export async function getOpenedMeetings({
  organizationId,
}: {
  organizationId: string;
}) {
  const meetings = await prisma.meeting.findMany({
    where: { organizationId, status: "OPEN" },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, photo: true } } },
      },
    },
  });
  return meetings;
}

export async function getClosedMeetings({
  organizationId,
}: {
  organizationId: string;
}) {
  const meetings = await prisma.meeting.findMany({
    where: { organizationId, status: "CLOSE" },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, photo: true } } },
      },
    },
  });
  return meetings;
}

export async function getOpenedMeetingByRoomName({
  roomName,
}: {
  roomName: string;
}) {
  const meeting = await prisma.meeting.findUnique({
    where: { roomName, status: "OPEN" },
  });
  return meeting;
}

export async function getClosedMeetingByRoomName({
  roomName,
}: {
  roomName: string;
}) {
  const meeting = await prisma.meeting.findUnique({ where: { roomName } });
  return meeting;
}

export async function closeMeetingByRoomName({
  organizationId,
  roomName,
}: {
  organizationId: string;
  roomName: string;
}) {
  const meeting = await prisma.meeting.update({
    where: { organizationId, roomName },
    data: { status: "CLOSE" },
  });
  return meeting;
}

export async function createMeeting({
  organizationId,
  description,
  roomName,
}: {
  roomName?: string;
  description?: string;
  organizationId: string;
}) {
  const uid = new ShortUniqueId({ length: 8 });

  const _roomName = roomName || uid.rnd();

  const meeting = await prisma.meeting.create({
    data: {
      roomName: _roomName,
      description,
      organizationId,
    },
  });

  return meeting;
}

export async function deleteClosedMeetingByRoomName({
  organizationId,
  roomName,
}: {
  organizationId: string;
  roomName: string;
}) {
  const meeting = await prisma.meeting.delete({
    where: { organizationId, roomName },
  });
  return meeting;
}
