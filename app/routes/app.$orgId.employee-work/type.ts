import {
  type Task as PrismaTask,
  type Project as PrismaProject,
} from "@prisma/client";

type Task = PrismaTask & { project: PrismaProject };

export interface CompletedTracker {
  id: string;
  userId: string;
  organizationId: string;
  taskId: string;
  startAt: Date;
  endAt: Date;
  week: number;
  year: number;
  taskCompletion: number;
  task: Task;
  note: string;
}

export type IncompletedTracker = {
  id: string;
  userId: string;
  organizationId: string;
  taskId: string;
  startAt: Date;
  endAt: null;
  week: number;
  year: number;
  taskCompletion: number;
  task: Task;
  note: string;
};
