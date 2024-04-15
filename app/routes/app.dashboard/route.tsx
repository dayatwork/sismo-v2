import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useNavigate } from "@remix-run/react";
import dayjs from "dayjs";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { cn } from "~/lib/utils";
import { useLiveLoader } from "~/utils/sse/use-live-loader";
import { Separator } from "~/components/ui/separator";
import { getWorkingUsers } from "~/services/user.server";
import Timer from "./timer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useLoggedInUser } from "~/utils/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import prisma from "~/lib/prisma";
import { requireUser } from "~/utils/auth.server";
import {
  BacklogIcon,
  CanceledIcon,
  DoneIcon,
  HighPriorityIcon,
  InProgressIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  NoPriorityIcon,
  OnHoldIcon,
  TodoIcon,
  UrgentIcon,
} from "~/components/icons";
import {
  ArrowRight,
  MoreHorizontalIcon,
  TargetIcon,
  TrendingUpIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import Tracker from "./tracker";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const users = await getWorkingUsers();
  const tasks = await prisma.boardTask.findMany({
    where: {
      ownerId: loggedInUser.id,
      status: { notIn: ["DONE", "ON_HOLD", "STUCK"] },
    },
    include: {
      board: { include: { workspace: { select: { id: true, name: true } } } },
    },
    orderBy: { timelineStart: "asc" },
    take: 3,
  });

  const runningTracker = await prisma.taskTracker.findFirst({
    where: { ownerId: loggedInUser.id, endAt: null },
    orderBy: { startAt: "desc" },
  });

  return json({ users, tasks, runningTracker });
}

export default function Dashboard() {
  const { users, tasks, runningTracker } = useLiveLoader<typeof loader>();
  const loggedInUser = useLoggedInUser();
  const navigate = useNavigate();

  const totalWorkingUsers = users.filter(
    (user) => user.taskTrackers.length > 0
  ).length;
  const totalUsers = users.length;

  return (
    <>
      <Outlet />
      <main className="p-6">
        <h1 className="sr-only">Dashboard</h1>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div>
              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-2 flex gap-6 p-6 rounded-xl border">
                  <Avatar className="rounded-lg w-32 h-32">
                    <AvatarImage
                      src={loggedInUser?.photo || ""}
                      className="object-cover"
                    />
                    <AvatarFallback>{loggedInUser?.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl leading-none mb-2 font-semibold">
                      {loggedInUser?.name}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {loggedInUser?.email}
                    </p>
                    {runningTracker?.startAt ? (
                      <Tracker startTime={runningTracker.startAt} />
                    ) : (
                      <p className="text-5xl text-muted-foreground">
                        Not Working
                      </p>
                    )}
                  </div>
                </div>
                <Card>
                  <CardHeader className="pb-4">
                    <CardDescription className="font-medium">
                      This Week
                    </CardDescription>
                    <CardTitle className="text-4xl">36 hours</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-sm text-muted-foreground">
                      90% from total weekly WH
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Progress value={90} aria-label="90%" />
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader className="pb-4">
                    <CardDescription className="font-medium">
                      This Month
                    </CardDescription>
                    <CardTitle className="text-4xl">143 hours</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-sm text-muted-foreground">
                      81.5% from total monthly WH
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Progress value={83} aria-label="90%" />
                  </CardFooter>
                </Card>
              </div>
            </div>
            <div className="border rounded-lg mt-6">
              <h2 className="font-semibold px-4 py-2">Your tasks</h2>
              <Separator />
              <Table>
                <TableHeader>
                  <TableRow className="sr-only">
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Board</TableHead>
                    <TableHead>Planned Effort</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
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
                      <TableCell className="font-semibold px-2 text-right text-red-600">
                        {task.timelineEnd &&
                          new Date() > new Date(task.timelineEnd) &&
                          `${dayjs().diff(
                            task.timelineEnd,
                            "day"
                          )} days past due`}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <Link
                          to={`/app/workspaces/${task.board?.workspaceId}/boards/${task.boardId}`}
                          className="hover:bg-accent font-medium border rounded-md px-3 py-1"
                        >
                          {task.board?.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground px-4 w-[135px]">
                        <div className="flex gap-2 items-center py-1 pl-2 pr-2.5 rounded">
                          <TargetIcon className="w-4 h-4" />
                          <span>{task.plannedEffortInMinutes} mins</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-32 text-muted-foreground">
                        {Boolean(task.timelineStart && task.timelineEnd) &&
                          dayjs(task.timelineStart).format("MMM D")}{" "}
                        - {dayjs(task.timelineEnd).format("MMM D")}
                      </TableCell>
                      {/* <TableCell className="w-12">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={task.owner.photo || ""}
                                  className="object-cover"
                                />
                                <AvatarFallback>
                                  {task.owner.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell> */}
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
                              <DropdownMenuLabel>Action</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => navigate(`task/${task.id}`)}
                              >
                                <TrendingUpIcon className="w-4 h-4 mr-2" />
                                See progress
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/app/workspaces/${task.board?.workspaceId}/boards/${task.boardId}`
                                  )
                                }
                              >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Go to board
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tasks.length === 0 && (
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
          <div className="pt-2.5 pb-4 pl-5 pr-4 border rounded-xl bg-neutral-50 dark:bg-neutral-900">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Working Users</h2>
              <p className="flex gap-1 border px-2 py-1 rounded-md">
                <span className="font-semibold text-green-600">
                  {totalWorkingUsers}
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="font-semibold">{totalUsers}</span>
              </p>
            </div>
            <ul className="flex flex-wrap gap-6">
              {users
                .sort((user) => (user.taskTrackers.length > 0 ? -1 : 1))
                .map((user) => (
                  <li key={user.id}>
                    <Link to={`/app/iam/users/${user.id}`}>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="space-y-3 w-20 group">
                            <div className="rounded-md relative">
                              <img
                                src={`https://ui-avatars.com/api/?name=${user.name}`}
                                alt={user.name}
                                className="h-20 w-auto object-cover transition-all group-hover:scale-105 aspect-square rounded-lg"
                              />
                              <span
                                className={cn(
                                  user.taskTrackers.length > 0
                                    ? "bg-green-600 animate-bounce"
                                    : "bg-slate-600 dark:bg-slate-400",
                                  `absolute w-5 h-5 rounded-full -top-2 -right-2 border-4 border-background`
                                )}
                              ></span>
                              {user.taskTrackers.length > 0 && (
                                <div className="absolute bottom-0 inset-x-0">
                                  <Timer
                                    startTime={user.taskTrackers[0].startAt}
                                    size="small"
                                    color="green"
                                    align="center"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h3 className="font-medium text-xs text-center">
                                {user.name}
                              </h3>
                            </div>
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-72">
                          <h2 className="font-semibold text-sm">
                            Tracker Info
                          </h2>
                          <Separator className="my-2" />
                          {user.taskTrackers.length > 0 ? (
                            <div>
                              {user.taskTrackers.map((tracker) => (
                                <dl key={tracker.id} className="space-y-4">
                                  <div>
                                    <dt className="text-primary font-semibold">
                                      Timer
                                    </dt>
                                    <dd>
                                      <Timer startTime={tracker.startAt} />
                                    </dd>
                                  </div>
                                </dl>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-sm text-muted-foreground">
                              Not working
                            </p>
                          )}
                        </HoverCardContent>
                      </HoverCard>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
