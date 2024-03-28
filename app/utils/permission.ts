export type Permission = {
  group: string;
  name: string;
  description: string;
};

export const permissions = [
  {
    group: "organization",
    name: "manage:organization",
    description:
      "Akses untuk manage data organizations (Directorates, Divisions, Job Level)",
  },
  {
    group: "employee",
    name: "manage:employee",
    description: "Akses untuk manage data employee",
  },
  {
    group: "department",
    name: "manage:department",
    description: "Akses untuk manage data department",
  },
  {
    group: "team",
    name: "manage:team",
    description: "Akses untuk manage data team",
  },
  {
    group: "workspace",
    name: "create:workspace",
    description: "Akses untuk create workspace",
  },
  {
    group: "iam",
    name: "manage:iam",
    description: "Akses untuk manage Identity and Access Management",
  },
  {
    group: "client",
    name: "manage:client",
    description: "Akses untuk manage data client",
  },
  {
    group: "project",
    name: "manage:project",
    description: "Akses untuk manage data project",
  },
  {
    group: "project",
    name: "manage:service",
    description: "Akses untuk manage data service",
  },
  {
    group: "project",
    name: "manage:product",
    description: "Akses untuk manage data product",
  },
  {
    group: "finance",
    name: "manage:finance",
    description: "Akses untuk manage data finance",
  },
  {
    group: "meeting",
    name: "manage:meeting",
    description: "Akses untuk manage data meeting",
  },
] as const;

export type PermissionName = (typeof permissions)[number]["name"];

type GroupedPermission = {
  groupName: string;
  permissions: {
    group: string;
    name: string;
    description: string;
  }[];
};

export const groupedPermissions = permissions.reduce((acc, permission) => {
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
}, [] as GroupedPermission[]);

type PermissionLookup = Record<string, Permission>;

export const permissionsLookup = permissions.reduce((acc, curr) => {
  return { ...acc, [curr.name]: curr };
}, {} as PermissionLookup);

export const hasPermissions = (permission: string | string[]) => {
  if (typeof permission === "string") {
    return Boolean(permissionsLookup[permission]);
  }
  permission.forEach((p) => {
    if (permissionsLookup[p]) {
      return true;
    }
  });
  return false;
};
