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

export const stageStatuses = [
  "UNSTARTED",
  "ONGOING",
  "ONHOLD",
  "COMPLETED",
] as const;
export type StageStatus = (typeof stageStatuses)[number];

export const stageStatusColor: Record<StageStatus, Color> = {
  UNSTARTED: "gray",
  ONGOING: "blue",
  ONHOLD: "orange",
  COMPLETED: "green",
};
