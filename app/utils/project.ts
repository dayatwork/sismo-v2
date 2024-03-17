export const projectStatuses = [
  "PROPOSED",
  "UNSTARTED",
  "ONGOING",
  "ONHOLD",
  "CLOSING",
  "CANCELED",
  "COMPLETED",
] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

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

export const projectStatusColor: Record<ProjectStatus, Color> = {
  PROPOSED: "indigo",
  UNSTARTED: "gray",
  ONGOING: "blue",
  ONHOLD: "yellow",
  CLOSING: "orange",
  CANCELED: "red",
  COMPLETED: "green",
};
