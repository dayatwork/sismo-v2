import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getSuperAdminDashboardData } from "~/services/super-admin.server";
import { getUserById } from "~/services/user.server";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUserById(id);

  if (!user) {
    return await authenticator.logout(request, { redirectTo: "/login" });
  }

  if (!user.isSuperAdmin) {
    return redirect("/app");
  }

  const { totalOrganizations, totalUsers } = await getSuperAdminDashboardData();

  return json({ totalOrganizations, totalUsers });
}

export default function AdminDashboard() {
  const { totalOrganizations, totalUsers } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-4 grid grid-cols-2 gap-6">
        <div className="border rounded-md p-4">
          <h2 className="text-lg font-bold mb-2">Organizations</h2>
          <p className="text-4xl font-bold">{totalOrganizations}</p>
        </div>
        <div className="border rounded-md p-4">
          <h2 className="text-lg font-bold mb-2">Users</h2>
          <p className="text-4xl font-bold">{totalUsers}</p>
        </div>
      </div>
    </div>
  );
}
