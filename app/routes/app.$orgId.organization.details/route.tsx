import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import { getOrganizationById } from "~/services/organization.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const organization = await getOrganizationById(organizationId);

  if (!organization) {
    return redirect("/app");
  }

  return json({ organization });
}

export default function OrganizationDetails() {
  const { organization } = useLoaderData<typeof loader>();
  return (
    <>
      <Outlet />
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Details</h1>
      </div>
      <dl className="grid gap-4 border px-6 py-4 rounded-md bg-neutral-50 dark:bg-neutral-900">
        <div className="flex items-center">
          <dt className="w-32">Name</dt>
          <span className="px-3">:</span>
          <dd>{organization.name}</dd>
        </div>
        <div className="flex items-center">
          <dt className="w-32">Description</dt>
          <span className="px-3">:</span>
          <dd>{organization.description || "-"}</dd>
        </div>
      </dl>
    </>
  );
}
