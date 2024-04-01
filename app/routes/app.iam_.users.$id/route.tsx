import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import {
  BadgeCheckIcon,
  Building2Icon,
  CircleDashedIcon,
  LayoutDashboard,
  MoreHorizontal,
  PenSquareIcon,
  Trash2Icon,
  UserCheck2,
  UserX2,
  Users2Icon,
} from "lucide-react";
import MainContainer from "~/components/main-container";
import { Button } from "~/components/ui/button";
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
                    <CircleDashedIcon className="text-muted-foreground" />
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
                    <CircleDashedIcon className="text-muted-foreground" />
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex-1 px-6">
            <div className="rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Personal Information</h3>
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
              <dl className="space-y-3">
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
                  <dd className="font-semibold">{user.memberId || "-"}</dd>
                </div>
                <div className="flex flex-col md:flex-row">
                  <dt className="w-36 font-medium text-muted-foreground text-sm md:text-base">
                    Member Status
                  </dt>
                  <dd className="font-semibold">{user.memberStatus || "-"}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-8 rounded-md max-w-2xl">
              <h3 className="font-bold ">Roles</h3>
              {user.roles.length > 0 ? (
                <ul className="mt-2 flex gap-2 flex-wrap">
                  {user.roles.map((role) => (
                    <li
                      key={role.id}
                      className="px-4 py-1 border rounded-lg text-sm font-semibold bg-accent border-foreground/20"
                    >
                      {role.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  This user does not have any role
                </p>
              )}
            </div>
            <div className="mt-8 rounded-md max-w-2xl">
              <h3 className="font-bold ">Departments</h3>
              {user.departmentMembers.length > 0 ? (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {user.departmentMembers.map((dm) => (
                    <Link
                      to={`/app/departments/${dm.departmentId}`}
                      key={dm.departmentId}
                      className="border rounded-lg flex gap-2 flex-col w-28 pt-3.5 pb-3 items-center justify-center hover:bg-accent"
                    >
                      {dm.department.logo ? (
                        <img
                          src={dm.department.logo}
                          className="w-8 h-8 object-cover"
                          alt={dm.department.name}
                        />
                      ) : (
                        <Building2Icon className="w-8 h-8" />
                      )}
                      <p className="text-sm font-semibold">
                        {dm.department.name}
                      </p>
                      <p className="text-xs font-semibold">({dm.role})</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  This user is not registered in any department
                </p>
              )}
            </div>
            <div className="mt-8 rounded-md max-w-2xl">
              <h3 className="font-bold ">Teams</h3>
              {user.teamMembers.length > 0 ? (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {user.teamMembers.map((tm) => (
                    <Link
                      to={`/app/teams/${tm.teamId}`}
                      key={tm.teamId}
                      className="border rounded-lg flex gap-2 flex-col w-28 pt-3.5 pb-3 items-center justify-center hover:bg-accent"
                    >
                      {tm.team.logo ? (
                        <img
                          src={tm.team.logo}
                          className="w-8 h-8 object-cover"
                          alt={tm.team.name}
                        />
                      ) : (
                        <Users2Icon className="w-8 h-8" />
                      )}
                      <p className="text-sm font-semibold">{tm.team.name}</p>
                      <p className="text-xs font-semibold">({tm.role})</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  This user is not registered in any department
                </p>
              )}
            </div>
          </div>
        </div>
      </MainContainer>
    </>
  );
}
