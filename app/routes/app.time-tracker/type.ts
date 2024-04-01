import { type BoardTask } from "@prisma/client";

export interface CompletedTracker {
  id: string;
  ownerId: string;
  startAt: Date;
  endAt: Date;
  week: number;
  year: number;
  trackerItems: {
    id: string;
    taskId: string;
    taskCompletion: number;
    task: BoardTask;
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
  ownerId: string;
  startAt: Date;
  endAt: null;
  week: number;
  year: number;
  trackerItems: {
    id: string;
    taskId: string;
    taskCompletion: number;
    task: BoardTask;
    note: string;
    attachments: {
      id: string;
      url: string;
      displayName: string;
      type: "FILE" | "DOCUMENT" | "LINK";
    }[];
  }[];
};
