import { useMatches } from "@remix-run/react";

import { type PermissionName } from "./permission";
import { type LoggedInUserPayload } from "./auth.server";

export function useLoggedInUser() {
  const matches = useMatches();
  const data = matches.find((match) => match.id === "routes/app")?.data as
    | { loggedInUser: LoggedInUserPayload }
    | undefined;
  return data?.loggedInUser;
}

export function useUserPermissions() {
  const matches = useMatches();
  const data = matches.find((match) => match.id === "routes/app")?.data as
    | { loggedInUser: LoggedInUserPayload }
    | undefined;
  const userPermissions: string[] = [];

  data?.loggedInUser?.roles.forEach((role) =>
    userPermissions.push(...role.permissions)
  );
  return { userPermissions, isSuperAdmin: data?.loggedInUser?.isSuperAdmin };
}

export function ProtectComponent({
  permission,
  children,
}: {
  permission?: PermissionName | PermissionName[];
  children: React.ReactNode;
}) {
  const { userPermissions, isSuperAdmin } = useUserPermissions();

  if (isSuperAdmin) {
    return children;
  }

  if (!permission) {
    return children;
  }

  if (typeof permission === "string") {
    if (!userPermissions.includes(permission)) {
      return null;
    }
  } else {
    let matchPermissions = 0;
    permission.forEach((perm) => {
      if (userPermissions.includes(perm)) {
        matchPermissions++;
      }
    });
    if (matchPermissions === 0) {
      return null;
    }
  }
  return children;
}
