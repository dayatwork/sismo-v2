import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { FileText } from "lucide-react";

import { Button, buttonVariants } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { getRoles } from "~/services/role.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const roles = await getRoles(organizationId);

  return json({ roles });
}

export default function OrganizationRoles() {
  const { roles } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <div className="mb-3 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
        {/* <ProtectComponent permission="manage:organization"> */}
        <Link to="new" className={cn(buttonVariants())}>
          + Add New Role
        </Link>
        {/* </ProtectComponent> */}
      </div>
      <div className="rounded-md border bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-center py-10 text-muted-foreground"
                  colSpan={5}
                >
                  No Data
                </TableCell>
              </TableRow>
            )}
            {roles.map((role) => (
              <TableRow key={role.id} className="group">
                <TableCell className="pl-6">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  {role.permissions.length}{" "}
                  {role.permissions.length === 1 ? "permission" : "permissions"}
                </TableCell>
                <TableCell>
                  {role.users.length}{" "}
                  {role.users.length === 1 ? "user" : "users"}
                </TableCell>
                <TableCell className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                  {/* <ProtectComponent permission="manage:organization"> */}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`${role.id}`} className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="pr-2 font-semibold">Details</span>
                    </Link>
                  </Button>

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
