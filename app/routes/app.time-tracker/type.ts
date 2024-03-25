import {
  type Task as PrismaTask,
  type Project as PrismaProject,
} from "@prisma/client";

type Task = PrismaTask & { project: PrismaProject };

export interface CompletedTracker {
  id: string;
  userId: string;
  startAt: Date;
  endAt: Date;
  week: number;
  year: number;
  trackerItems: {
    id: string;
    taskId: string;
    taskCompletion: number;
    task: Task;
    note: string;
    attachments: {
      id: string;
      url: string;
      displayName: string;
      type: "FILE" | "DOCUMENT" | "LINK";
    }[];
  }[];
}

export type IncompletedTracker = {
  id: string;
  userId: string;
  startAt: Date;
  endAt: null;
  week: number;
  year: number;
  trackerItems: {
    id: string;
    taskId: string;
    taskCompletion: number;
    task: Task;
    note: string;
    attachments: {
      id: string;
      url: string;
      displayName: string;
      type: "FILE" | "DOCUMENT" | "LINK";
    }[];
  }[];
};
