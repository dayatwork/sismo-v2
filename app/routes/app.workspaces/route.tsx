import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { FileText } from "lucide-react";
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
import { getWorkspaces } from "~/services/workspace.server";
import { requireUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);

  const workspaces = await getWorkspaces();

  return json({ workspaces });
}

export default function Workspaces() {
  const { workspaces } = useLoaderData<typeof loader>();

  return (
    <MainContainer>
      <Outlet />
      <div className="mb-3 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
        {/* <ProtectComponent permission="manage:organization"> */}
        <Link to="new" className={cn(buttonVariants())}>
          + Add New Workspace
        </Link>
        {/* </ProtectComponent> */}
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
                  colSpan={5}
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
                      <Link to={`${workspace.id}`} className="cursor-pointer">
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
