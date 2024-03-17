import { useRef } from "react";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import dayjs from "dayjs";
import {
  CalendarClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  FolderKanbanIcon,
  MoreHorizontalIcon,
  PenSquareIcon,
  TrashIcon,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
  BacklogIcon,
  CanceledIcon,
  DoneIcon,
  InProgressIcon,
  TodoIcon,
} from "~/components/icons";
import { SearchInput } from "~/components/search-input";
import { cn } from "~/lib/utils";
import MainContainer from "~/components/main-container";
import { requireOrganizationUser } from "~/utils/auth.server";
import { getAssigneeTasks } from "~/services/task.server";
import { getUserStages } from "~/services/stage.server";

const VALID_STATUS = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELED",
] as const;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  const url = new URL(request.url);
  const taskNameOrCode = url.searchParams.get("search") || undefined;
  const stageId = url.searchParams.get("stageId") || "all";
  const status = url.searchParams.getAll("status");
  const sort = url.searchParams.get("sort") || "latest";

  const pageSize = 10;
  const page = url.searchParams.get("page")
    ? Number(url.searchParams.get("page")) || 1
    : 1;
  const skip = (page - 1) * pageSize;

  const validatedStatus = status.filter((s) =>
    VALID_STATUS.some((vs) => vs === s)
  ) as unknown as (typeof VALID_STATUS)[number][];

  const [{ tasks, totalTasks }, myProjectStages] = await Promise.all([
    getAssigneeTasks({
      assigneeId: loggedInUser.id,
      organizationId,
      pageSize,
      skip,
      sort,
      stageId,
      taskNameOrCode,
      status: validatedStatus.length ? { in: validatedStatus } : undefined,
    }),
    getUserStages({ organizationId, userId: loggedInUser.id }),
  ]);

  return json({
    tasks,
    myProjectStages,
    hasNextPage: totalTasks > pageSize * page,
    totalTasks,
    totalPage: Math.ceil(totalTasks / pageSize),
  });
}

export default function YourTasks() {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { tasks, myProjectStages, hasNextPage, totalTasks, totalPage } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { orgId } = useParams<{ orgId: string }>();

  const searchText = searchParams.get("search") || undefined;
  const filterStageId = searchParams.get("stageId") || "all";
  const sort = searchParams.get("sort") || "latest";
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const status = searchParams.getAll("status");
  const validatedStatus = status.filter((s) =>
    VALID_STATUS.some((vs) => vs === s)
  ) as unknown as (typeof VALID_STATUS)[number][];

  const clearFilter = () => {
    setSearchParams();
  };

  const handlePrevious = () => {
    setSearchParams((prev) => {
      prev.set("page", String(page - 1));
      return prev;
    });
  };

  const handleNext = () => {
    setSearchParams((prev) => {
      prev.set("page", String(page + 1));
      return prev;
    });
  };

  const handleSort = (sort: string) => {
    setSearchParams((prev) => {
      prev.set("sort", sort);
      return prev;
    });
  };

  const handleSearchForm = (search: string) => {
    setSearchParams((prev) => {
      if (search) {
        prev.set("search", search);
      } else {
        prev.delete("search");
      }
      prev.set("page", "1");
      return prev;
    });
  };
  const handleClearSearchForm = () => {
    setSearchParams((prev) => {
      prev.delete("search");
      prev.set("page", "1");
      return prev;
    });
    if (searchRef.current?.value) {
      searchRef.current!.value = "";
    }
  };

  const handleFilterProject = (stageId: string | undefined) => {
    if (!stageId) return;
    setSearchParams((prev) => {
      prev.set("stageId", stageId);
      prev.set("page", "1");
      return prev;
    });
  };

  const handleFilterStatus = (status: string, action: "add" | "remove") => {
    if (!status) return;
    setSearchParams((prev) => {
      if (action === "add") {
        prev.append("status", status);
      } else {
        prev.delete("status", status);
      }
      prev.set("page", "1");
      return prev;
    });
  };

  return (
    <MainContainer>
      <Outlet />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Your Tasks</h1>
        <Link to="new" className={buttonVariants()}>
          + Add Task
        </Link>
      </div>

      <div className="border rounded-md bg-neutral-50 dark:bg-neutral-900">
        <div className="py-2 px-3 flex justify-between gap-4 items-center">
          <SearchInput
            key={searchText}
            onClear={handleClearSearchForm}
            onSearch={handleSearchForm}
            placeholder="Search by code or name"
            defaultValue={searchText}
          />

          <div className="flex items-center gap-2">
            <Select
              key={filterStageId}
              value={filterStageId}
              onValueChange={handleFilterProject}
            >
              <SelectTrigger className="whitespace-nowrap gap-4 capitalize">
                <span className="w-[200px] overflow-hidden text-left text-ellipsis">
                  <SelectValue placeholder="Filter by project" />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filter by project</SelectLabel>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="all-project">All Project Tasks</SelectItem>
                  <SelectItem value="null">All Personal Tasks</SelectItem>
                  {myProjectStages.length > 0 && (
                    <>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Projects</SelectLabel>
                        {myProjectStages.map((stage) => (
                          <SelectItem
                            key={stage.id}
                            value={stage.id}
                            className="capitalize"
                          >
                            {stage.name} - {stage.project.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="whitespace-nowrap bg-background h-10"
                >
                  {validatedStatus.length
                    ? validatedStatus.length === 1
                      ? `1 Status`
                      : `${validatedStatus.length} Statuses`
                    : "Filter Status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onCheckedChange={(c) =>
                    handleFilterStatus("BACKLOG", c ? "add" : "remove")
                  }
                  className="flex items-center gap-2"
                  checked={status.includes("BACKLOG")}
                >
                  <BacklogIcon />
                  <span>Backlog</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onCheckedChange={(c) =>
                    handleFilterStatus("TODO", c ? "add" : "remove")
                  }
                  className="flex items-center gap-2"
                  checked={status.includes("TODO")}
                >
                  <TodoIcon />
                  <span>Todo</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onCheckedChange={(c) =>
                    handleFilterStatus("IN_PROGRESS", c ? "add" : "remove")
                  }
                  className="flex items-center gap-2"
                  checked={status.includes("IN_PROGRESS")}
                >
                  <InProgressIcon />
                  <span>In Progress</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onCheckedChange={(c) =>
                    handleFilterStatus("DONE", c ? "add" : "remove")
                  }
                  className="flex items-center gap-2"
                  checked={status.includes("DONE")}
                >
                  <DoneIcon />
                  <span>Done</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onCheckedChange={(c) =>
                    handleFilterStatus("CANCELED", c ? "add" : "remove")
                  }
                  className="flex items-center gap-2"
                  checked={status.includes("CANCELED")}
                >
                  <CanceledIcon />
                  <span>Canceled</span>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Select key={sort} defaultValue={sort} onValueChange={handleSort}>
              <SelectTrigger className="whitespace-nowrap gap-4 capitalize">
                <span className="w-[100px] overflow-hidden text-left text-ellipsis">
                  <SelectValue placeholder="Sort by" />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort by</SelectLabel>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="duedate-desc">Due Date Desc</SelectItem>
                  <SelectItem value="duedate-asc">Due Date Asc</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className={cn(
                "whitespace-nowrap ",
                searchParams.size ? "border-red-600 text-red-600" : "border"
              )}
              onClick={clearFilter}
              disabled={!searchParams.size}
            >
              Clear Filter
            </Button>
          </div>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Code</TableHead>
              <TableHead className="whitespace-nowrap">Task Name</TableHead>
              <TableHead className="pl-6">Type</TableHead>
              <TableHead className="whitespace-nowrap">
                Stage - Project Name
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="whitespace-nowrap">Due Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-muted-foreground"
                >
                  No Tasks
                </TableCell>
              </TableRow>
            )}
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="py-3 pl-6 w-32 font-mono tracking-wide">
                  {task.code}
                </TableCell>
                <TableCell className="py-3">
                  <span className="max-w-xs line-clamp-1">{task.name}</span>
                  <span className="max-w-xs line-clamp-1 text-muted-foreground">
                    {task.description}
                  </span>
                </TableCell>
                <TableCell className="py-3 pl-6 w-32 pr-6">
                  <Badge
                    className="uppercase whitespace-nowrap flex justify-center"
                    variant={task.type === "PROJECT" ? "indigo" : "cyan"}
                  >
                    {task.type.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 space-x-2">
                  {task.stage ? (
                    <p className="line-clamp-1">
                      <span className="capitalize">{task.stage.name}</span>
                      <span>-</span>
                      <span>{task.stage.project.name}</span>
                    </p>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="py-3 w-28">
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

                <TableCell className="py-3 w-36">
                  {task.dueDate ? (
                    <span className="flex items-center whitespace-nowrap">
                      <CalendarClockIcon className="mr-2 w-4 h-4" />
                      <time dateTime={task.dueDate} className="line-clamp-1">
                        {dayjs(task.dueDate).format("MMM D, YYYY")}
                      </time>
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="py-3 w-16 pr-6">
                  {/* <Link
                      to={`/app/stages/${task.stageId}/tasks/${task.id}/details`}
                      className={cn(
                        buttonVariants({ variant: "link" }),
                        "p-0 h-6"
                      )}
                    >
                      Details
                    </Link> */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded border hover:bg-action">
                        <MoreHorizontalIcon className="w-4 h-4" />
                        <span className="sr-only">Action</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Action</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="pr-3"
                        onClick={() => navigate(`${task.id}/details`)}
                      >
                        <FileTextIcon className="w-4 h-4 mr-2" />
                        Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="pr-3"
                        disabled={
                          task.type !== "PERSONAL" ||
                          ["done", "canceled"].includes(task.status)
                        }
                        onClick={() => navigate(`${task.id}/edit`)}
                      >
                        <PenSquareIcon className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pr-3 text-red-600"
                        disabled={
                          task.type !== "PERSONAL" ||
                          ["done", "canceled"].includes(task.status)
                        }
                        onClick={() => navigate(`${task.id}/delete`)}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="pr-3"
                        disabled={task.type === "PERSONAL"}
                        onClick={() =>
                          navigate(
                            `/app/${orgId}/stages/${task.stageId}/tasks/${task.id}/details`
                          )
                        }
                      >
                        <FolderKanbanIcon className="w-4 h-4 mr-2" />
                        Go to project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator />
        {totalPage > 1 && (
          <div className="py-2 px-6 flex gap-2 justify-between items-center">
            <p className="text-sm text-muted-foreground space-x-6">
              <span>
                Page {page} of {totalPage}
              </span>
              <span>|</span>
              <span className="font-semibold">
                {totalTasks} {totalTasks !== 1 ? "tasks" : "task"}
              </span>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrevious}
                disabled={page <= 1}
                className="pr-5"
              >
                <ChevronLeftIcon className="mr-2 w-4 h-4" />
                <span>Previous</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNext}
                className="pl-5"
                disabled={!hasNextPage}
              >
                <span>Next</span>
                <ChevronRightIcon className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainContainer>
  );
}
