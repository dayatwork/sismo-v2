import ShortUniqueId from "short-unique-id";
import prisma from "~/lib/prisma";

export async function getOpenedMeetings() {
  const meetings = await prisma.meeting.findMany({
    where: { status: "OPEN" },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, photo: true } } },
      },
    },
  });
  return meetings;
}

export async function getClosedMeetings() {
  const meetings = await prisma.meeting.findMany({
    where: { status: "CLOSE" },
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
  roomName,
}: {
  roomName: string;
}) {
  const meeting = await prisma.meeting.update({
    where: { roomName },
    data: { status: "CLOSE" },
  });
  return meeting;
}

export async function createMeeting({
  description,
  roomName,
}: {
  roomName?: string;
  description?: string;
}) {
  const uid = new ShortUniqueId({ length: 8 });

  const _roomName = roomName || uid.rnd();

  const meeting = await prisma.meeting.create({
    data: {
      roomName: _roomName,
      description,
    },
  });

  return meeting;
}

export async function deleteClosedMeetingByRoomName({
  roomName,
}: {
  roomName: string;
}) {
  const meeting = await prisma.meeting.delete({
    where: { roomName },
  });
  return meeting;
}
