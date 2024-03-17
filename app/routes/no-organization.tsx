import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { authenticator } from "~/services/auth.server";
import { getUserWithOrganizations } from "~/services/user.server";

// export async function loader({ request }: LoaderFunctionArgs) {
//   const user = await authenticator.isAuthenticated(request, {
//     failureRedirect: "/login",
//   });
//   return json({ user });
// }

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

  return json({ user });
}

export default function NoOrganization() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center">
      <h1 className="mb-4 text-xl font-semibold">
        User with email {user.email} does not have an organization.{" "}
      </h1>
      <p className="mb-6 text-lg text-muted-foreground">
        Please contact admin to add you to the organization
      </p>
      <form method="post" action="/logout">
        <Button size="lg" className="text-lg" type="submit">
          Log out
        </Button>
      </form>
    </div>
  );
}
