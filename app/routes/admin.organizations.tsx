import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";

import { getOrganizationsWithStatistic } from "~/services/organization.server";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { CheckCircle, MoreHorizontal, UserPlus, XCircle } from "lucide-react";

export async function loader() {
  const organizations = await getOrganizationsWithStatistic();

  return json({ organizations });
}

export default function AdminOrganizations() {
  const { organizations } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Outlet />
      <div>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Organizations</h1>
          <Button asChild>
            <Link to="create">Create New Organization</Link>
          </Button>
        </div>
        <div className="mt-3 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Total Users</TableHead>
                <TableHead>Total Projects</TableHead>
                <TableHead>Total Tasks</TableHead>
                <TableHead>Total Attachments</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center">
                    No Organizations
                  </TableCell>
                </TableRow>
              )}
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="pl-4 font-mono">{org.id}</TableCell>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{org.totalUsers}</TableCell>
                  <TableCell>{org.totalProjects}</TableCell>
                  <TableCell>{org.totalTasks}</TableCell>
                  <TableCell>{org.totalAttachments}</TableCell>
                  <TableCell>
                    <span className="flex justify-center">
                      {org.isActive && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="flex justify-end pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="outline">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/admin/organizations/${org.id}/add-admin`)
                          }
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add organization admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {org.isActive ? (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              navigate(
                                `/admin/organizations/${org.id}/deactivate`
                              )
                            }
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Deactivate organization
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() =>
                              navigate(
                                `/admin/organizations/${org.id}/activate`
                              )
                            }
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Activate organization
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
