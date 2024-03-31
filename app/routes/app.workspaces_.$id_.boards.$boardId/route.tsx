import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  BarChart,
  FolderKanbanIcon,
  KeyRoundIcon,
  LayoutDashboard,
  MoreHorizontalIcon,
  PenSquareIcon,
  PlusIcon,
  RefreshCcwDotIcon,
  TargetIcon,
  Trash2Icon,
  TrendingUpIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";
import dayjs from "dayjs";

import {
  BacklogIcon,
  CanceledIcon,
  DoneIcon,
  InProgressIcon,
  TodoIcon,
  OnHoldIcon,
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  NoPriorityIcon,
  UrgentIcon,
} from "~/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { getBoardById } from "~/services/board.server";

import { requireUser } from "~/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect("/app/workspaces");
  }

  const boardId = params.boardId;
  if (!boardId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  await requireUser(request);

  const board = await getBoardById({ id: boardId });
  if (!board) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  return json({ board });
}

export default function Board() {
  const { board } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div>
      <Outlet />
      {board.status === "ARCHIVED" && (
        <div className="max-w-7xl mx-auto mt-2 px-4">
          <p
            role="alert"
            className="text-sm font-semibold text-center px-4 py-1 border border-orange-600 text-orange-600 rounded-md bg-orange-600/5"
          >
            This board is archived
          </p>
        </div>
      )}
      {board.status === "DELETED" && (
        <div className="max-w-7xl mx-auto mt-2 px-4">
          <p
            role="alert"
            className="text-sm font-semibold text-center px-4 py-1 border border-red-600 text-red-600 rounded-md bg-red-600/5"
          >
            This board is in trash
          </p>
        </div>
      )}
      <div className="relative max-w-7xl mx-auto px-4 mt-5">
        <div className="flex gap-5">
          <div>
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
                  <BreadcrumbLink href="/app/workspaces">
                    Workspaces
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {board.workspace.status === "ARCHIVED" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/app/workspaces/archived">
                        Archived
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/app/workspaces/${board.workspaceId}`}>
                    {board.workspace.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {board.status === "ARCHIVED" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href={`/app/workspaces/${board.workspaceId}/boards/archived`}
                      >
                        Archived
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{board.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-3xl font-bold leading-none">{board.name}</h2>
              <Badge className="uppercase pl-2">
                {board.privacy === "PUBLIC" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                )}
                {board.privacy}
              </Badge>
            </div>
            <p className="text-muted-foreground">{board.description}</p>
          </div>

          {board.status === "ACTIVE" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="ml-auto mt-4" variant="outline">
                  <MoreHorizontalIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Action</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("edit")}>
                  <PenSquareIcon className="w-4 h-4 mr-2" />
                  Edit board
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("archive")}
                  className="text-orange-600"
                >
                  <ArchiveIcon className="w-4 h-4 mr-2" />
                  Move to archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("trash")}
                  className="text-red-600"
                >
                  <Trash2Icon className="w-4 h-4 mr-2" />
                  Move to trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {board.status === "ARCHIVED" && (
            <div className="flex gap-2 ml-auto mt-2">
              <Link
                to="restore"
                className={buttonVariants({ variant: "outline" })}
              >
                <ArchiveRestoreIcon className="w-4 h-4 mr-2" />
                Restore board
              </Link>
              <Link
                to="restore"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "text-red-600 border-red-600/50 hover:bg-red-600/10 hover:text-red-600"
                )}
              >
                <Trash2Icon className="w-4 h-4 mr-2" />
                Move to trash
              </Link>
            </div>
          )}
          {board.status === "DELETED" && (
            <div className="flex gap-2 ml-auto mt-2">
              <Link
                to="restore"
                className={buttonVariants({ variant: "outline" })}
              >
                <ArchiveRestoreIcon className="w-4 h-4 mr-2" />
                Restore board
              </Link>
              <Link
                to="delete"
                className={cn(buttonVariants({ variant: "destructive" }))}
              >
                <Trash2Icon className="w-4 h-4 mr-2" />
                Delete board
              </Link>
            </div>
          )}
        </div>
        <Tabs defaultValue="tasks" className="mt-6">
          <TabsList className="gap-1">
            <TabsTrigger
              className="pl-6 pr-8 hover:bg-background"
              value="tasks"
            >
              <FolderKanbanIcon className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger
              className="pl-6 pr-8 hover:bg-background"
              value="members"
            >
              <UsersRoundIcon className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tasks">
            <div className="flex items-center justify-between mt-4 mb-2">
              <Input placeholder="Search task..." className="max-w-[250px]" />
              {board.status === "ACTIVE" && (
                <Link
                  to="groups/new"
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <PlusIcon className="w-3.5 h-3.5 mr-2" /> New Group
                </Link>
              )}
            </div>

            <div className="space-y-4 mt-4">
              {board.taskGroups.map((group) => (
                <div key={group.id}>
                  <div className="flex justify-between items-center border rounded-lg rounded-b-none px-4 py-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <h3 className="font-semibold text-sm">{group.name}</h3>
                    </div>
                    <Link
                      to={`groups/${group.id}/tasks/new`}
                      className={buttonVariants({
                        size: "sm",
                        variant: "ghost",
                      })}
                    >
                      <PlusIcon className="w-3.5 h-3.5 mr-2" /> New Task
                    </Link>
                  </div>
                  <div className="border rounded-lg rounded-t-none mt-0.5">
                    <Table>
                      <TableHeader>
                        <TableRow className="sr-only">
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Planned Effort</TableHead>
                          <TableHead>Timeline</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="pl-4 w-8">
                              <div className="p-1 rounded w-6 flex justify-center">
                                {task.priority === "NO_PRIORITY" ? (
                                  <NoPriorityIcon />
                                ) : task.priority === "URGENT" ? (
                                  <UrgentIcon />
                                ) : task.priority === "HIGH" ? (
                                  <HighPriorityIcon />
                                ) : task.priority === "MEDIUM" ? (
                                  <MediumPriorityIcon />
                                ) : task.priority === "LOW" ? (
                                  <LowPriorityIcon />
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="py-1">
                                {task.status === "BACKLOG" ? (
                                  <p className="flex gap-2 items-center">
                                    <BacklogIcon />
                                    <span className="whitespace-nowrap text-muted-foreground">
                                      Backlog
                                    </span>
                                  </p>
                                ) : task.status === "TODO" ? (
                                  <p className="flex gap-2 items-center">
                                    <TodoIcon />
                                    <span className="whitespace-nowrap text-muted-foreground">
                                      Todo
                                    </span>
                                  </p>
                                ) : task.status === "IN_PROGRESS" ? (
                                  <p className="flex gap-2 items-center">
                                    <InProgressIcon />
                                    <span className="whitespace-nowrap text-muted-foreground">
                                      In Progress
                                    </span>
                                  </p>
                                ) : task.status === "DONE" ? (
                                  <p className="flex gap-2 items-center">
                                    <DoneIcon />
                                    <span className="whitespace-nowrap text-muted-foreground">
                                      Done
                                    </span>
                                  </p>
                                ) : task.status === "STUCK" ? (
                                  <p className="flex gap-2 items-center">
                                    <CanceledIcon />
                                    <span className="whitespace-nowrap text-muted-foreground">
                                      Stuck
                                    </span>
                                  </p>
                                ) : task.status === "ON_HOLD" ? (
                                  <p className="flex gap-2 items-center">
                                    <OnHoldIcon />
                                    <span className="whitespace-nowrap text-muted-foreground">
                                      On Hold
                                    </span>
                                  </p>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold px-2">
                              {task.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground px-4 w-[135px]">
                              <div className="flex gap-2 items-center py-1 pl-2 pr-2.5 rounded">
                                <TargetIcon className="w-4 h-4" />
                                <span>{task.plannedEffortInMinutes} mins</span>
                              </div>
                            </TableCell>
                            <TableCell className="w-32 text-muted-foreground">
                              {Boolean(
                                task.timelineStart && task.timelineEnd
                              ) &&
                                dayjs(task.timelineStart).format("MMM D")}{" "}
                              - {dayjs(task.timelineEnd).format("MMM D")}
                            </TableCell>
                            <TableCell className="w-12">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={task.owner.photo || ""}
                                  className="object-cover"
                                />
                                <AvatarFallback>
                                  {task.owner.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="pr-4 w-14">
                              <div className="flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      className="ml-auto"
                                      variant="outline"
                                    >
                                      <MoreHorizontalIcon className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                      Action
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <TrendingUpIcon className="w-4 h-4 mr-2" />
                                      See progress
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(
                                          `groups/${group.id}/tasks/${task.id}/edit`
                                        )
                                      }
                                    >
                                      <PenSquareIcon className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(
                                          `groups/${group.id}/tasks/${task.id}/change-priority`
                                        )
                                      }
                                    >
                                      <BarChart className="w-4 h-4 mr-2" />
                                      Change priority
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(
                                          `groups/${group.id}/tasks/${task.id}/change-status`
                                        )
                                      }
                                    >
                                      <RefreshCcwDotIcon className="w-4 h-4 mr-2" />
                                      Change status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(
                                          `groups/${group.id}/tasks/${task.id}/change-owner`
                                        )
                                      }
                                    >
                                      <UserRoundIcon className="w-4 h-4 mr-2" />
                                      Change owner
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() =>
                                        navigate(
                                          `groups/${group.id}/tasks/${task.id}/delete`
                                        )
                                      }
                                    >
                                      <Trash2Icon className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {group.tasks.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center text-muted-foreground py-8"
                            >
                              No tasks
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="members">
            <div className="flex items-center justify-between mt-4 mb-2">
              <Input placeholder="Search member..." className="max-w-[250px]" />
              {board.status === "ACTIVE" && (
                <Link
                  to="members/new"
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <PlusIcon className="w-3.5 h-3.5 mr-2" /> New Member
                </Link>
              )}
            </div>
            {board.boardMembers.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">No members</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="pr-4">
                        <span className="sr-only">Action</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {board.boardMembers.map((bm) => (
                      <TableRow key={bm.userId}>
                        <TableCell className="pl-4">
                          <div className="flex gap-2 items-center">
                            <Avatar>
                              <AvatarImage
                                src={bm.user.photo || ""}
                                className="object-cover"
                              />
                              <AvatarFallback>{bm.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">
                              {bm.user.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{bm.isOwner ? "Owner" : "Member"}</TableCell>
                        <TableCell className="pr-4">
                          <div className="flex justify-end items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  className="ml-auto"
                                  variant="outline"
                                >
                                  <MoreHorizontalIcon className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Action</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`members/${bm.userId}/change-role`)
                                  }
                                >
                                  <KeyRoundIcon className="w-4 h-4 mr-2" />
                                  Change role
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`members/${bm.userId}/remove`)
                                  }
                                  className="text-red-600"
                                >
                                  <Trash2Icon className="w-4 h-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
