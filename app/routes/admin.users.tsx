import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { CheckCircle, MoreHorizontal, XCircle } from "lucide-react";

import { getUsers } from "~/services/user.server";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
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

export async function loader() {
  const users = await getUsers();

  return json({ users });
}

export default function AdminUsers() {
  const { users } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Outlet />
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="mt-4 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-[120px] text-center whitespace-nowrap">
                  Super Admin
                </TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    No Users
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={user.photo || undefined}
                          className="object-cover"
                        />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <span className="flex justify-center">
                      {user.isSuperAdmin && (
                        <CheckCircle className="w-6 h-6 text-yellow-600" />
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex justify-center">
                      {user.isActive && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="flex justify-end pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button size="icon" variant="outline">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user.isActive ? (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => navigate(`${user.id}/deactivate`)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Deactivate user
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => navigate(`${user.id}/activate`)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Activate user
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
