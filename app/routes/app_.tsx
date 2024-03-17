import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { getUserWithOrganizations } from "~/services/user.server";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUserWithOrganizations(userId);

  if (!user) {
    return await authenticator.logout(request, { redirectTo: "/login" });
  }

  const activeOrganizations = user.organizationUsers.filter(
    (orgUser) => orgUser.organization.isActive
  );

  if (activeOrganizations.length > 0) {
    const organizationUser = activeOrganizations[0];
    return redirect(`/app/${organizationUser.organizationId}`);
  }

  if (user.isSuperAdmin) {
    return redirect("/admin");
  }

  return redirect("/no-organization");
}

export default function AppLayout() {
  return <Outlet />;
}
