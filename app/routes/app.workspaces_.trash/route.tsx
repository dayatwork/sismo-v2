import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { FileText, LayoutDashboard, Trash2Icon } from "lucide-react";
import MainContainer from "~/components/main-container";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getWorkspaces } from "~/services/workspace.server";
import { requireUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);

  const workspaces = await getWorkspaces({ status: "DELETED" });

  return json({ workspaces });
}

export default function TrashWorkspaces() {
  const { workspaces } = useLoaderData<typeof loader>();

  return (
    <MainContainer>
      <Outlet />
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
            <BreadcrumbLink href="/app/workspaces">Workspaces</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Trash</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-4 flex gap-3 items-center">
        <Trash2Icon className="w-7 h-7 mt-0.5 text-red-600" />
        <h1 className="text-2xl font-bold tracking-tight">Trash Workspaces</h1>
      </div>
      <div className="rounded-md border bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Privacy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="w-[60px]">
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspaces.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-center py-10 text-muted-foreground"
                  colSpan={6}
                >
                  No Data
                </TableCell>
              </TableRow>
            )}
            {workspaces.map((workspace) => (
              <TableRow key={workspace.id} className="group">
                <TableCell className="pl-6 font-semibold">
                  {workspace.name}
                </TableCell>
                <TableCell>{workspace.description}</TableCell>
                <TableCell>{workspace.privacy}</TableCell>
                <TableCell>{workspace.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    <Avatar>
                      <AvatarImage
                        src={workspace.owner.photo || ""}
                        className="object-cover"
                      />
                      <AvatarFallback>{workspace.owner.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{workspace.owner.name}</span>
                  </div>
                </TableCell>
                <TableCell className="opacity-0 group-hover:opacity-100 pr-4">
                  {/* <ProtectComponent permission="manage:organization"> */}
                  <div className="flex justify-end items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={`/app/workspaces/${workspace.id}`}
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
