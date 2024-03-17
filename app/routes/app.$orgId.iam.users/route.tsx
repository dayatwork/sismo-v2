import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import {
  CheckCircle,
  MoreHorizontal,
  PenSquareIcon,
  Trash2Icon,
  UserCheck2,
  UserX2,
} from "lucide-react";

import { Button, buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { getOrganizationUsers } from "~/services/user.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const organizationUsers = await getOrganizationUsers(organizationId);

  return json({ organizationUsers });
}

export default function OrganizationUsers() {
  const { organizationUsers } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Outlet />
      <div className="mb-3 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        {/* <ProtectComponent permission="manage:organization"> */}
        <Link to="new" className={cn(buttonVariants())}>
          + Add New User
        </Link>
        {/* </ProtectComponent> */}
      </div>
      <div className="rounded-md border bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="whitespace-nowrap">Member ID</TableHead>
              <TableHead className="whitespace-nowrap">Member Status</TableHead>
              <TableHead className="text-center">Admin</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="w-[60px]">
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizationUsers.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-center py-10 text-muted-foreground"
                  colSpan={5}
                >
                  No Data
                </TableCell>
              </TableRow>
            )}
            {organizationUsers.map((organizationUser) => (
              <TableRow key={organizationUser.id} className="group">
                <TableCell className="pl-6">
                  {organizationUser.user.name}
                </TableCell>
                <TableCell>{organizationUser.user.email}</TableCell>
                <TableCell>{organizationUser.memberId}</TableCell>
                <TableCell>{organizationUser.memberStatus}</TableCell>
                <TableCell>
                  <span className="flex justify-center">
                    {organizationUser.isAdmin && (
                      <CheckCircle className="w-6 h-6 text-yellow-600" />
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex justify-center">
                    {organizationUser.isActive && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </span>
                </TableCell>
                <TableCell className="pr-6 flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline">
                        <span className="sr-only">Action</span>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Action</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={organizationUser.isAdmin}
                        onClick={() =>
                          navigate(`${organizationUser.userId}/edit`)
                        }
                      >
                        <PenSquareIcon className="mr-2 w-4 h-4" />
                        Edit
                      </DropdownMenuItem>
                      {organizationUser.isActive ? (
                        <DropdownMenuItem
                          className="text-orange-600"
                          disabled={organizationUser.isAdmin}
                          onClick={() =>
                            navigate(`${organizationUser.userId}/deactivate`)
                          }
                        >
                          <UserX2 className="mr-2 w-4 h-4" />
                          Deactivate account
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-green-600"
                          disabled={organizationUser.isAdmin}
                          onClick={() =>
                            navigate(`${organizationUser.userId}/activate`)
                          }
                        >
                          <UserCheck2 className="mr-2 w-4 h-4" />
                          Activate account
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        disabled={organizationUser.isAdmin}
                        onClick={() =>
                          navigate(`${organizationUser.userId}/delete`)
                        }
                      >
                        <Trash2Icon className="mr-2 w-4 h-4" />
                        Delete user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* </ProtectComponent> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
