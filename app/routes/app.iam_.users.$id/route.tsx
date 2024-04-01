import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import {
  BadgeCheckIcon,
  LayoutDashboard,
  MoreHorizontal,
  PenSquareIcon,
  Trash2Icon,
  UserCheck2,
  UserX2,
} from "lucide-react";
import MainContainer from "~/components/main-container";
import { cn } from "~/lib/utils";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { requirePermission } from "~/utils/auth.server";
import { getUserById } from "~/services/user.server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const userId = params.id;
  if (!userId) {
    return redirect(`/app/employees`);
  }

  await requirePermission(request, "manage:employee");

  const user = await getUserById(userId);

  if (!user) {
    return redirect(`/app/employees`);
  }

  return json({ user });
}

export default function UserDetails() {
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Outlet context={{ user }} />

      <MainContainer>
        <Breadcrumb className="mb-4 mt-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/app/dashboard">
                <span className="sr-only">Dashboard</span>
                <LayoutDashboard className="w-5 h-5" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/app/iam">IAM</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/app/iam/users">Users</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{user.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex mt-6 gap-0 md:gap-2 xl:gap-6 2xl:gap-10 items-start">
          <div className="flex-shrink-0">
            <h1 className="sr-only">Employee Details</h1>
            <div className="overflow-hidden rounded-md">
              <img
                src={
                  user.photo
                    ? user.photo
                    : `https://ui-avatars.com/api/?name=${user.name}`
                }
                alt={user.name}
                className="h-24 md:32 lg:h-44 xl:h-52 w-auto object-cover transition-all hover:scale-105 aspect-square"
              />
            </div>
            <dl className="mt-4 space-y-1">
              <div className="flex items-center justify-between gap-2 px-4 py-2 border rounded-md bg-neutral-50 dark:bg-neutral-900">
                <dt className="font-semibold">Password</dt>
                <dd>
                  {user.hasPassword ? (
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
                  {user?.connections.find(
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
              <div className="flex justify-between items-center">
                <h3 className="font-bold mb-2">Personal Information</h3>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                    {user.isSuperAdmin && (
                      <p className="px-4 py-1 rounded-full border font-semibold text-sm text-[#FFD700] border-[#FFD700]/30">
                        Super Admin
                      </p>
                    )}
                    {user.isActive ? (
                      <p className="px-4 py-1 rounded-full border font-semibold text-sm text-green-600 border-green-600/30">
                        Active
                      </p>
                    ) : (
                      <p className="px-4 py-1 rounded-full border font-semibold text-sm text-orange-600 border-orange-600/30">
                        Inactive
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline">
                        <span className="sr-only">Action</span>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Action</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={user.isSuperAdmin}
                        onClick={() => navigate(`edit`)}
                      >
                        <PenSquareIcon className="mr-2 w-4 h-4" />
                        Edit
                      </DropdownMenuItem>
                      {user.isActive ? (
                        <DropdownMenuItem
                          className="text-orange-600"
                          disabled={user.isSuperAdmin}
                          onClick={() => navigate(`deactivate`)}
                        >
                          <UserX2 className="mr-2 w-4 h-4" />
                          Deactivate account
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-green-600"
                          disabled={user.isSuperAdmin}
                          onClick={() => navigate(`activate`)}
                        >
                          <UserCheck2 className="mr-2 w-4 h-4" />
                          Activate account
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        disabled={user.isSuperAdmin}
                        onClick={() => navigate(`delete`)}
                      >
                        <Trash2Icon className="mr-2 w-4 h-4" />
                        Delete user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <dl className="space-y-2">
                <div className="flex flex-col md:flex-row">
                  <dt className="w-36 font-medium text-muted-foreground text-sm md:text-base">
                    Name
                  </dt>
                  <dd className="font-semibold">{user.name}</dd>
                </div>
                <div className="flex flex-col md:flex-row">
                  <dt className="w-36 font-medium text-muted-foreground text-sm md:text-base">
                    Email
                  </dt>
                  <dd className="font-semibold">{user.email}</dd>
                </div>
                <div className="flex flex-col md:flex-row">
                  <dt className="w-36 font-medium text-muted-foreground text-sm md:text-base">
                    Phone Number
                  </dt>
                  <dd className="font-semibold">{user.phone || "-"}</dd>
                </div>
                <div className="flex flex-col md:flex-row">
                  <dt className="w-36 font-medium text-muted-foreground text-sm md:text-base">
                    Member ID
                  </dt>
                  <dd className="font-semibold">{user.memberId}</dd>
                </div>
                <div className="flex flex-col md:flex-row">
                  <dt className="w-36 font-medium text-muted-foreground text-sm md:text-base">
                    Member Status
                  </dt>
                  <dd className="font-semibold">{user.memberStatus}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-10 rounded-md max-w-2xl">
              <div className="mb-2 flex justify-between items-center">
                <h3 className="font-bold ">Positions</h3>
                {user.positions.length ? (
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
              {user.positions.length ? (
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
                      {user.positions.map((position) => (
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
