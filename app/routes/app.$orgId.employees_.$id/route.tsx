import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import Breadcrumbs from "~/components/ui/breadcrumbs";
import { BadgeCheckIcon, Trash2Icon } from "lucide-react";
import MainContainer from "~/components/main-container";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { requirePermission } from "~/utils/auth.server";
import { getOrganizationUser } from "~/services/user.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:employee"
  );

  if (!loggedInUser) {
    return redirect(`/app/${organizationId}`);
  }

  const userId = params.id;
  if (!userId) {
    return redirect(`/app/${organizationId}/employees`);
  }

  const organizationUser = await getOrganizationUser({
    organizationId,
    userId,
  });

  if (!organizationUser) {
    return redirect(`/app/${organizationId}/employees`);
  }

  return json({ organizationUser });
}

export default function EmployeeDetails() {
  const { organizationUser } = useLoaderData<typeof loader>();
  const { orgId } = useParams<{ orgId: string }>();

  return (
    <>
      <Outlet context={{ organizationUser }} />

      <MainContainer>
        <Breadcrumbs
          pages={[
            {
              name: "Employees",
              href: `/app/${orgId}/employees`,
              current: false,
            },
            {
              name: organizationUser.user.name,
              href: `/app/employees/${organizationUser.user.id}`,
              current: true,
            },
          ]}
        />

        <div className="flex mt-6 gap-0 md:gap-2 xl:gap-6 2xl:gap-10 items-start">
          <div className="flex-shrink-0">
            <h1 className="sr-only">Employee Details</h1>
            <div className="overflow-hidden rounded-md">
              <img
                src={
                  organizationUser.user.photo
                    ? organizationUser.user.photo
                    : `https://ui-avatars.com/api/?name=${organizationUser.user.name}`
                }
                alt={organizationUser.user.name}
                className="h-24 md:32 lg:h-44 xl:h-52 w-auto object-cover transition-all hover:scale-105 aspect-square"
              />
            </div>
            <dl className="mt-4 space-y-1">
              <div className="flex items-center justify-between gap-2 px-4 py-2 border rounded-md bg-neutral-50 dark:bg-neutral-900">
                <dt className="font-semibold">Password</dt>
                <dd>
                  {organizationUser.user?.password ? (
                    <BadgeCheckIcon className="text-green-600" />
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      not set
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-2 border rounded-md bg-neutral-50 dark:bg-neutral-900">
                <dt className="font-semibold">Google</dt>
                <dd>
                  {organizationUser.user?.connections.find(
                    (con) => con.providerName === "google"
                  ) ? (
                    <BadgeCheckIcon className="text-green-600" />
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      not set
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex-1 px-6">
            <div className="rounded-md">
              <h3 className="font-bold mb-2">Personal Information</h3>
              <dl className="space-y-2">
                <div className="flex flex-col md:flex-row">
                  <dt className="w-36 font-medium text-muted-foreground text-sm md:text-base">
                    Name
                  </dt>
                  <dd className="font-semibold">
                    {organizationUser.user.name}
                  </dd>
                </div>
                <div className="flex flex-col md:flex-row">
                  <dt className="w-36 font-medium text-muted-foreground text-sm md:text-base">
                    Email
                  </dt>
                  <dd className="font-semibold">
                    {organizationUser.user.email}
                  </dd>
                </div>
                <div className="flex flex-col md:flex-row">
                  <dt className="w-36 font-medium text-muted-foreground text-sm md:text-base">
                    Phone Number
                  </dt>
                  <dd className="font-semibold">
                    {organizationUser.user.phone}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-10 rounded-md max-w-2xl">
              <div className="mb-2 flex justify-between items-center">
                <h3 className="font-bold ">Positions</h3>
                {organizationUser.user.positions.length ? (
                  // <ProtectComponent permission="manage:employee">
                  <Link
                    to="new-position"
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" })
                    )}
                  >
                    + New Position
                  </Link>
                ) : // </ProtectComponent>
                null}
              </div>
              {organizationUser.user.positions.length ? (
                <div className="border rounded bg-neutral-50 dark:bg-neutral-900">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Job Level</TableHead>
                        <TableHead className="sr-only">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizationUser.user.positions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell>
                            {position.division.directorate.name}
                          </TableCell>
                          <TableCell>{position.division.name}</TableCell>
                          <TableCell>{position.jobLevel.name}</TableCell>
                          <TableCell className="flex justify-end">
                            {/* <ProtectComponent permission="manage:employee"> */}
                            <Link
                              to={`position/${position.id}/delete`}
                              className="flex w-8 h-8 items-center justify-center rounded border hover:bg-destructive/10 border-destructive/40"
                            >
                              <Trash2Icon className="w-4 h-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Link>
                            {/* </ProtectComponent> */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="pt-6 pb-6 flex items-center flex-col rounded border border-dashed space-y-4">
                  <p className="text-muted-foreground text-center">
                    The employee does not have a position yet
                  </p>

                  {/* <ProtectComponent permission="manage:employee"> */}
                  <Link
                    to="new-position"
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    + New Position
                  </Link>
                  {/* </ProtectComponent> */}
                </div>
              )}
            </div>
            {/* <div className="mt-10 rounded-md max-w-2xl">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="font-bold ">Roles</h3>
            </div>
            {employee.user?.roles.length ? (
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="sr-only">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.user.roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          {role.permissions.length} permissions
                        </TableCell>
                        <TableCell className="flex justify-end"></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="pt-6 pb-6 flex items-center flex-col rounded border border-dashed space-y-4">
                <p className="text-muted-foreground text-center">
                  The employee does not have a role yet
                </p>
              </div>
            )}
          </div> */}
          </div>
        </div>
      </MainContainer>
    </>
  );
}
