import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { CheckCircle, FileText } from "lucide-react";
import MainContainer from "~/components/main-container";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

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
import { getOrganizationUsers } from "~/services/user.server";
import { requirePermission } from "~/utils/auth.server";

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

  const organizationUsers = await getOrganizationUsers(organizationId);

  return json({ organizationUsers });
}

export default function Employees() {
  const { organizationUsers } = useLoaderData<typeof loader>();

  return (
    <MainContainer>
      <Outlet />
      <div className="mb-3 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        {/* <ProtectComponent permission="manage:organization"> */}
        <Link to="new" className={cn(buttonVariants())}>
          + Add New Employee
        </Link>
        {/* </ProtectComponent> */}
      </div>
      <div className="rounded-md border bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="whitespace-nowrap">Member ID</TableHead>
              <TableHead className="whitespace-nowrap">Member Status</TableHead>
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
                <TableCell className="pl-5">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={organizationUser.user.photo || ""}
                        alt={organizationUser.user.name}
                      />
                      <AvatarFallback>
                        {organizationUser.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">
                      {organizationUser.user.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <p>{organizationUser.user.email}</p>
                  <p>{organizationUser.user.phone}</p>
                </TableCell>
                <TableCell>{organizationUser.memberId}</TableCell>
                <TableCell>{organizationUser.memberStatus}</TableCell>
                <TableCell>
                  <span className="flex justify-center">
                    {organizationUser.isActive && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </span>
                </TableCell>
                <TableCell className="opacity-0 group-hover:opacity-100 pr-4">
                  {/* <ProtectComponent permission="manage:organization"> */}
                  <div className="flex justify-end items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={`${organizationUser.user.id}`}
                        className="cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <span>Details</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainContainer>
  );
}
