import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import dayjs from "dayjs";
import { ChevronLeftIcon, PlusIcon, UploadIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import {
  BacklogIcon,
  CanceledIcon,
  DoneIcon,
  InProgressIcon,
  TodoIcon,
} from "~/components/icons";

import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { AttachmentCard } from "~/components/attachment-card";
import { getTaskById } from "~/services/task.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const stageId = params.id!;
  const taskId = params.taskId!;

  const task = await getTaskById({ id: taskId, organizationId });

  if (!task) {
    return redirect(`/app/${organizationId}/stages/${stageId}/tasks`);
  }

  return json({ task });
}

export default function TaskDetails() {
  const { task } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id: stageId, orgId } = useParams<{ id: string; orgId: string }>();

  return (
    <>
      <Outlet />
      <div className="-mt-px border rounded-b-md rounded-tr-md bg-neutral-50 dark:bg-neutral-900">
        <div className="py-2 pl-3 pr-6 flex justify-between items-center">
          <button
            onClick={() => navigate(`/app/${orgId}/stages/${stageId}/tasks`)}
            className="py-1.5 pl-1.5 pr-4 rounded hover:bg-accent flex gap-1 items-center"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">Back to task list</span>
          </button>
        </div>
        <Separator />
        <div className="grid grid-cols-2">
          <div className="border-r">
            <h3 className="py-2 px-6 font-semibold text-primary">
              Task Details
            </h3>
            <Separator />
            <dl className="px-6 py-4 space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd>{task.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Description</dt>
                <dd>{task.description}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd>
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
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Due Date</dt>
                <dd>{dayjs(task.dueDate).format("MMM D, YYYY")}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Assignee</dt>
                <dd>
                  {task.assignee ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="w-9 h-9">
                        <AvatarImage
                          src={task.assignee.photo || ""}
                          className="object-cover"
                          alt={task.assignee.name}
                        />
                        <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold">
                        {task.assignee.name}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <div>
              <h3 className="py-2 px-6 font-semibold text-primary">Trackers</h3>
              <Separator />
              {task.trackerItems.length === 0 ? (
                <p className="py-10 text-center text-muted-foreground">
                  No trackers
                </p>
              ) : (
                <ul className="px-6 py-6 rounded-md">
                  {task.trackerItems.map((trackerItem, index) => (
                    <li key={trackerItem.id}>
                      <TimeTrackerItem
                        last={task.trackerItems.length - 1 === index}
                        percentage={trackerItem.taskCompletion}
                        workingDuration={trackerItem.workDurationInMinutes}
                        note={trackerItem.note || ""}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Separator />
            <div>
              <div className="py-1.5 px-6 flex items-center justify-between">
                <h3 className="font-semibold text-primary">Documents</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-sm font-semibold rounded px-3 py-1 hover:bg-accent border">
                      Action
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Action</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => navigate("upload")}>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        <span>Upload File</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("add-link")}>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        <span>Add Link</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Separator />
              {task.attachments.length === 0 ? (
                <p className="py-10 text-center text-muted-foreground">
                  No documents
                </p>
              ) : (
                <ul className="px-6 py-4 flex gap-2 flex-wrap">
                  {task.attachments.map((attachment) => (
                    <li key={attachment.id}>
                      <AttachmentCard attachment={attachment} size="small" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface TimeTrackerItemProps {
  last: boolean;
  percentage: number;
  workingDuration: number;
  note: string;
}

function TimeTrackerItem({
  last = false,
  percentage,
  note,
  workingDuration,
}: TimeTrackerItemProps) {
  return (
    <div className={cn("relative", last ? "pb-0" : "pb-8")}>
      {!last && (
        <span
          className="absolute left-5 top-4 -ml-px h-full w-0.5 bg-slate-600"
          aria-hidden="true"
        ></span>
      )}
      <div className="relative flex space-x-3">
        <div>
          <span
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center ring-4 bg-background font-bold text-sm",
              percentage > 80
                ? "text-green-600 ring-green-600"
                : percentage > 70
                ? "text-blue-600 ring-blue-600"
                : percentage > 50
                ? "text-orange-600 ring-orange-600"
                : "text-red-600 ring-red-600"
            )}
          >
            {percentage}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between">
          <div>
            {/* <p className="whitespace-nowrap  text-sm">
              {workingDuration} minutes
            </p> */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-muted-foreground max-w-xs truncate">
                    Note : {note}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="text-sm max-w-xs">
                  {note}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="font-semibold">{workingDuration} min</p>
        </div>
      </div>
    </div>
  );
}
