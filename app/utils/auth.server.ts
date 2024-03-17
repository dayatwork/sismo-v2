import { authenticator } from "~/services/auth.server";
import { getOrganizationUser } from "~/services/user.server";
import { type PermissionName } from "./permission";

export type LoggedInUserPayload = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo: string | null;
  isSuperAdmin: boolean;
  hasPassword: boolean;
  isAdmin: boolean;
  roles: { id: string; name: string; permissions: string[] }[];
  memberId: string | null;
  memberStatus: "FULLTIME" | "INTERN" | "OUTSOURCED" | "PARTTIME";
  organization: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
};

export async function requireOrganizationUser(
  request: Request,
  organizationId: string
) {
  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const organizationUser = await getOrganizationUser({
    organizationId,
    userId,
  });

  const loggedInUser = organizationUserToLoggedInUser(organizationUser);

  return loggedInUser;
}

export async function requirePermission(
  request: Request,
  organizationId: string,
  permission: PermissionName
) {
  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const organizationUser = await getOrganizationUser({
    organizationId,
    userId,
  });

  const loggedInUser = organizationUserToLoggedInUser(organizationUser);

  if (!loggedInUser) {
    return null;
  }

  if (loggedInUser.isAdmin) {
    return loggedInUser;
  }

  const allPermissions: string[] = [];

  loggedInUser.roles.forEach((role) =>
    allPermissions.push(...role.permissions)
  );

  const hasPermission = allPermissions.includes(permission);

  if (hasPermission) {
    return loggedInUser;
  }

  return null;
}

export function organizationUserToLoggedInUser(
  organizationUser: Awaited<ReturnType<typeof getOrganizationUser>>
): LoggedInUserPayload | null {
  if (!organizationUser) {
    return null;
  }
  return {
    id: organizationUser.user.id,
    name: organizationUser.user.name,
    email: organizationUser.user.email,
    phone: organizationUser.user.phone,
    photo: organizationUser.user.photo,
    hasPassword: !!organizationUser.user.password?.hash,
    isSuperAdmin: organizationUser.user.isSuperAdmin,
    isAdmin: organizationUser.isAdmin,
    roles: organizationUser.user.roles,
    memberId: organizationUser.memberId,
    memberStatus: organizationUser.memberStatus,
    organization: {
      id: organizationUser.organization.id,
      name: organizationUser.organization.name,
      isActive: organizationUser.organization.isActive,
    },
  };
}
