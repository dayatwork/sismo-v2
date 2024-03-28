export type WorkspacePermission = {
  group: string;
  name: string;
  description: string;
};

export const workspacePermissions = [
  {
    group: "workspace",
    name: "manage:workspace",
    description: "Akses untuk manage workspace",
  },
  {
    group: "board",
    name: "manage:board",
    description: "Akses untuk manage board",
  },
  {
    group: "member",
    name: "manage:member",
    description: "Akses untuk manage member",
  },
  {
    group: "permission",
    name: "manage:permission",
    description: "Akses untuk manage permission",
  },
] as const;

export type WorkspacePermissionName =
  (typeof workspacePermissions)[number]["name"];

type GroupedWorkspacePermission = {
  groupName: string;
  permissions: {
    group: string;
    name: string;
    description: string;
  }[];
};

export const groupedWorkspacePermissions = workspacePermissions.reduce(
  (acc, permission) => {
    const existingGroup = acc.find(
      (group) => group.groupName === permission.group
    );

    if (existingGroup) {
      existingGroup.permissions.push({
        group: permission.group,
        name: permission.name,
        description: permission.description,
      });
    } else {
      acc.push({
        groupName: permission.group,
        permissions: [
          {
            group: permission.group,
            name: permission.name,
            description: permission.description,
          },
        ],
      });
    }

    return acc;
  },
  [] as GroupedWorkspacePermission[]
);

type WorkspacePermissionLookup = Record<string, WorkspacePermission>;

export const workspacePermissionsLookup = workspacePermissions.reduce(
  (acc, curr) => {
    return { ...acc, [curr.name]: curr };
  },
  {} as WorkspacePermissionLookup
);

export const hasWorkspacePermissions = (permission: string | string[]) => {
  if (typeof permission === "string") {
    return Boolean(workspacePermissionsLookup[permission]);
  }
  permission.forEach((p) => {
    if (workspacePermissionsLookup[p]) {
      return true;
    }
  });
  return false;
};
