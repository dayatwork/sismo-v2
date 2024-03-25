import { type User, type Role } from "@prisma/client";
import { authenticator } from "~/services/auth.server";
import { type PermissionName } from "./permission";
import { getUserById } from "~/services/user.server";
import { redirect } from "@remix-run/node";

export type LoggedInUserPayload =
  | Omit<User, "password"> & { roles: Role[]; hasPassword: boolean };

export async function requireUser(
  request: Request
): Promise<LoggedInUserPayload> {
  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const loggedInUser = await getUserById(userId);
  if (!loggedInUser) {
    throw redirect("/login");
  }

  return loggedInUser;
}

export async function requirePermission(
  request: Request,
  permission: PermissionName,
  failureRedirect?: string
): Promise<LoggedInUserPayload> {
  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const loggedInUser = await getUserById(userId);

  if (!loggedInUser) {
    throw redirect("/login");
  }

  if (loggedInUser.isSuperAdmin) {
    return loggedInUser;
  }

  const allPermissions: string[] = [];

  loggedInUser.roles.forEach((role) =>
    allPermissions.push(...role.permissions)
  );

  const hasPermission = allPermissions.includes(permission);

  if (!hasPermission) {
    throw redirect(failureRedirect || "/unauthorized");
  }

  return loggedInUser;
}
