import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import {
  ArchiveIcon,
  FolderKanban,
  Lock,
  LockOpen,
  MoreHorizontalIcon,
  Trash2Icon,
  Users2,
} from "lucide-react";

import MainContainer from "~/components/main-container";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { requireUser } from "~/utils/auth.server";
import { getWorkspaces } from "~/services/workspace.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);

  const workspaces = await getWorkspaces({ status: "ACTIVE" });

  return json({ workspaces });
}

export default function Workspaces() {
  const { workspaces } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <MainContainer>
      <Outlet />
      <div className="mb-3 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
        <div className="flex gap-2">
          <Link to="new" className={cn(buttonVariants())}>
            + Add New Workspace
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline">
                <MoreHorizontalIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>More</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("archived")}>
                <ArchiveIcon className="w-4 h-4 mr-2" />
                Archived
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("trash")}>
                <Trash2Icon className="w-4 h-4 mr-2" />
                Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {workspaces.map((workspace) => (
          <Link key={workspace.id} to={workspace.id}>
            <Card className="hover:bg-accent">
              <CardHeader className="py-3">
                <CardTitle className="text-2xl">{workspace.name}</CardTitle>
                <CardDescription>{workspace.description}</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="py-4">
                <dl className="space-y-4">
                  <div className="grid gap-1">
                    <dt className="w-16 text-muted-foreground text-sm">
                      Privacy
                    </dt>
                    <dd className="font-semibold flex gap-2 items-center">
                      {workspace.privacy === "CLOSED" ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <LockOpen className="w-4 h-4" />
                      )}
                      {workspace.privacy}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="w-16 text-muted-foreground text-sm">
                      Members
                    </dt>
                    <dd className="font-semibold flex gap-2 items-center">
                      <Users2 className="w-4 h-4" />
                      {workspace.workspaceMembers.length} members
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="w-16 text-muted-foreground text-sm">
                      Boards
                    </dt>
                    <dd className="font-semibold flex gap-2 items-center">
                      <FolderKanban className="w-4 h-4" />
                      {workspace.boards.length} boards
                    </dd>
                  </div>
                </dl>
              </CardContent>
              <Separator />
              <CardFooter className="py-3">
                <div className="flex gap-2 items-center">
                  <Avatar>
                    <AvatarImage
                      src={workspace.owner.photo || ""}
                      className="object-cover"
                    />
                    <AvatarFallback>{workspace.owner.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{workspace.owner.name}</span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      {/* <div className="rounded-md border bg-neutral-50 dark:bg-neutral-900">
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
      </div> */}
    </MainContainer>
  );
}
