export const taskStatuses = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELED",
] as const;
export type TaskStatus = (typeof taskStatuses)[number];

type Color =
  | "gray"
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "indigo"
  | "pink"
  | "purple"
  | "cyan"
  | "orange"
  | "lime";

export const taskStatusColor: Record<TaskStatus, Color> = {
  BACKLOG: "gray",
  TODO: "orange",
  CANCELED: "red",
  DONE: "green",
  IN_PROGRESS: "blue",
};
