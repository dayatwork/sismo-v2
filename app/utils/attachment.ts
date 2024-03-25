export type Attachment = {
  id: string;
  url: string;
  displayName: string;
  projectId: string | null;
  stageId: string | null;
  taskId: string | null;
  trackerItemId: string | null;
  type: "DOCUMENT" | "LINK" | "FILE";
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
};
