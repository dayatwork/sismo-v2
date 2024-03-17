import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import dayjs from "dayjs";
import {
  CalendarCheck2Icon,
  CalendarClockIcon,
  CalendarX2Icon,
  EyeIcon,
  MoreHorizontalIcon,
  PenSquareIcon,
  PlusIcon,
  Trash2Icon,
  UserCheck2Icon,
  UserMinus2Icon,
  XIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  BacklogIcon,
  CanceledIcon,
  DoneIcon,
  InProgressIcon,
  TodoIcon,
} from "~/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getStageTasks } from "~/services/task.server";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getMilestones } from "~/services/milestone.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const stageId = params.id!;

  const url = new URL(request.url);
  const milestoneIdSearchParams = url.searchParams.get("milestoneId");
  const milestoneId =
    milestoneIdSearchParams === "all" ||
    typeof milestoneIdSearchParams !== "string"
      ? undefined
      : milestoneIdSearchParams;

  const [tasks, milestones] = await Promise.all([
    getStageTasks({ organizationId, stageId, milestoneId }),
    getMilestones({ organizationId, stageId }),
  ]);

  return json({ tasks, milestones });
}

export default function StageTasks() {
  const { tasks, milestones } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const milestoneId = searchParams.get("milestoneId");

  return (
    <>
      <Outlet />
      <div className="-mt-px border rounded-b-md rounded-tr-md bg-neutral-50 dark:bg-neutral-900">
        <div className="py-2 px-6 flex justify-between items-center">
          <h2 className="font-semibold text-primary">Tasks</h2>

          <div className="flex gap-4 items-center">
            <Select
              defaultValue={milestoneId || undefined}
              onValueChange={(value) =>
                setSearchParams((prev) => {
                  prev.set("milestoneId", value);
                  return prev;
                })
              }
            >
              <SelectTrigger className="w-[180px] h-[38px]">
                <SelectValue placeholder="Filter by milestone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tasks</SelectItem>
                {milestones.map((milestone) => (
                  <SelectItem key={milestone.id} value={milestone.id}>
                    {milestone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tasks.length > 0 && (
              <Button variant="outline" onClick={() => navigate("add")}>
                + New Task
              </Button>
            )}
          </div>
        </div>
        <Separator />
        {tasks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Code</TableHead>
                <TableHead className="px-3">Task Name</TableHead>
                <TableHead className="px-3">Status</TableHead>
                <TableHead className="px-3">Due Date</TableHead>
                <TableHead className="px-3">Assignee</TableHead>
                <TableHead className="px-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="p-3 pl-6 w-32 font-mono">
                    {task.code}
                  </TableCell>
                  <TableCell className="p-3">
                    <p className="font-semibold">{task.name}</p>
                    {task.description ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="text-muted-foreground max-w-md truncate">
                            {task.description}
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md">
                            {task.description}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </TableCell>
                  <TableCell className="p-3 w-36">
                    {task.status === "BACKLOG" ? (
                      <p className="flex gap-2 items-center">
                        <BacklogIcon />
                        <span className="whitespace-nowrap font-semibold">
                          Backlog
                        </span>
                      </p>
                    ) : task.status === "TODO" ? (
                      <p className="flex gap-2 items-center">
                        <TodoIcon />
                        <span className="whitespace-nowrap font-semibold">
                          Todo
                        </span>
                      </p>
                    ) : task.status === "IN_PROGRESS" ? (
                      <p className="flex gap-2 items-center">
                        <InProgressIcon />
                        <span className="whitespace-nowrap font-semibold">
                          In Progress
                        </span>
                      </p>
                    ) : task.status === "DONE" ? (
                      <p className="flex gap-2 items-center">
                        <DoneIcon />
                        <span className="whitespace-nowrap font-semibold">
                          Done
                        </span>
                      </p>
                    ) : task.status === "CANCELED" ? (
                      <p className="flex gap-2 items-center">
                        <CanceledIcon />
                        <span className="whitespace-nowrap font-semibold">
                          Canceled
                        </span>
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="p-3 w-36">
                    {task.dueDate ? (
                      <span className="flex items-center">
                        <CalendarClockIcon className="w-4 h-4 mr-2" />
                        <span>{dayjs(task.dueDate).format("MMM D, YYYY")}</span>
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="p-3 whitespace-nowrap w-28">
                    {task.assignee ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center justify-center">
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={task.assignee.photo || ""}
                                className="object-cover"
                                alt={task.assignee.name}
                              />
                              <AvatarFallback>
                                {task.assignee.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>{task.assignee.name}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="p-3 pr-6 w-16">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 border rounded">
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => navigate(`${task.id}/details`)}
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            <span>Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`${task.id}/edit`)}
                            disabled={["DONE", "CANCELED"].includes(
                              task.status
                            )}
                          >
                            <PenSquareIcon className="w-4 h-4 mr-2" />
                            <span>Edit Task</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => navigate(`${task.id}/assign`)}
                            disabled={!!task.assigneeId}
                          >
                            <UserCheck2Icon className="w-4 h-4 mr-2" />
                            <span>Assign Task</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`${task.id}/unassign`)}
                            disabled={
                              ["DONE", "CANCELED"].includes(task.status) ||
                              !task.assigneeId
                            }
                          >
                            <UserMinus2Icon className="w-4 h-4 mr-2" />
                            <span>Unassign Task</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`${task.id}/change-due-date`)
                            }
                            disabled={["DONE", "CANCELED"].includes(
                              task.status
                            )}
                          >
                            <CalendarCheck2Icon className="w-4 h-4 mr-2" />
                            <span>
                              {task.dueDate
                                ? "Change Due Date"
                                : "Set Due Date"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`${task.id}/remove-due-date`)
                            }
                            disabled={
                              ["DONE", "CANCELED"].includes(task.status) ||
                              !task.dueDate
                            }
                          >
                            <CalendarX2Icon className="w-4 h-4 mr-2" />
                            <span>Remove Due Date</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => navigate(`${task.id}/cancel`)}
                            disabled={["DONE", "CANCELED"].includes(
                              task.status
                            )}
                          >
                            <XIcon className="w-4 h-4 mr-2" />
                            <span>Cancel Task</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            disabled={
                              !["BACKLOG", "CANCELED"].includes(task.status)
                            }
                            onClick={() => navigate(`${task.id}/delete`)}
                          >
                            <Trash2Icon className="w-4 h-4 mr-2" />
                            <span>Remove Task</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="pb-10 pt-12 flex flex-col gap-2 items-center justify-center">
            <p className="text-muted-foreground">No Tasks</p>
            <Button
              variant="outline"
              size="sm"
              className="pl-2"
              onClick={() => navigate("add")}
            >
              <PlusIcon className="mr-2 w-4 h-4" />
              New Task
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
