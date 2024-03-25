import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Modal,
  Dialog,
  MenuTrigger,
  Button,
  Popover,
  Menu,
  MenuItem,
  Heading,
} from "react-aria-components";

import { Separator } from "~/components/ui/separator";
import {
  BacklogIcon,
  CanceledIcon,
  DoneIcon,
  InProgressIcon,
  TodoIcon,
} from "~/components/icons";
import dayjs from "dayjs";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { PlusIcon, UploadIcon } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import { AttachmentCard } from "~/components/attachment-card";
import { getAssigneeTaskById } from "~/services/task.server";
import { requireUser } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const taskId = params.id;
  if (!taskId) {
    return redirect(`/app/your-tasks`);
  }

  const loggedInUser = await requireUser(request);

  const task = await getAssigneeTaskById({
    assigneeId: loggedInUser.id,
    taskId,
  });

  if (!task) {
    return redirect(`/app/your-tasks`);
  }

  return json({ task });
}

export default function EditTask() {
  const { task } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Outlet />
      <Modal
        isDismissable
        isOpen={true}
        onOpenChange={() => navigate(`/app/your-tasks`)}
        className="overflow-hidden w-full max-w-6xl"
      >
        <Dialog className="bg-background border rounded-md p-6 outline-none">
          <Heading slot="title" className="text-lg font-semibold mb-6">
            Task Details
          </Heading>
          <div className="grid grid-cols-2 border rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <div className="border-r">
              <div className="py-2 px-6 flex justify-between items-center">
                <h3 className="font-semibold text-primary">Task</h3>
                <span
                  className={cn(
                    "uppercase text-xs font-semibold px-3 py-0.5 rounded-full",
                    task.type === "PROJECT" ? "bg-indigo-600" : "bg-teal-600"
                  )}
                >
                  {task.type}
                </span>
              </div>
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
                  <dd>
                    {task.dueDate
                      ? dayjs(task.dueDate).format("MMM D, YYYY")
                      : "-"}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <div>
                <h3 className="py-2 px-6 font-semibold text-primary">
                  Trackers
                </h3>
                <Separator />
                {task.trackerItems.length === 0 ? (
                  <p className="py-10 text-center text-muted-foreground">
                    No trackers
                  </p>
                ) : (
                  <ul className="px-6 py-6 rounded-md">
                    {task.trackerItems.map((tracker, index) => (
                      <li key={tracker.id}>
                        <TimeTrackerItem
                          last={task.trackerItems.length - 1 === index}
                          percentage={tracker.taskCompletion}
                          // startAt={tracker.startAt}
                          // endAt={tracker.endAt!}
                          note={tracker.note || ""}
                          workDurationInMinutes={tracker.workDurationInMinutes}
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

                  <MenuTrigger>
                    <Button className="text-sm font-semibold rounded px-3 py-1 hover:bg-accent border">
                      Action
                    </Button>
                    <Popover placement="bottom end">
                      <Menu
                        className="border rounded bg-background shadow-lg shadow-primary/20"
                        onAction={(id) => navigate(id.toString())}
                      >
                        <MenuItem
                          id="add-link"
                          className="text-sm font-semibold flex items-center pl-2 pr-4 py-2 cursor-pointer hover:bg-accent"
                        >
                          <PlusIcon className="mr-2 w-4 h-4" /> Add Link
                        </MenuItem>
                        <MenuItem
                          id="upload"
                          className="text-sm font-semibold flex items-center pl-2 pr-4 py-2 cursor-pointer hover:bg-accent"
                        >
                          <UploadIcon className="mr-2 w-4 h-4" /> Upload
                          Document
                        </MenuItem>
                      </Menu>
                    </Popover>
                  </MenuTrigger>
                </div>
                <Separator />
                {task.attachments.length === 0 ? (
                  <p className="py-10 text-center text-muted-foreground">
                    No documents
                  </p>
                ) : (
                  <ul className="px-6 py-4 grid grid-cols-4 gap-2">
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
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "outline" })}
              onPress={() => navigate(`/app/your-tasks`)}
            >
              Close
            </Button>
          </div>
        </Dialog>
      </Modal>
    </>
  );
}

interface TimeTrackerItemProps {
  last: boolean;
  percentage: number;
  // startAt: string;
  // endAt: string;
  note: string;
  workDurationInMinutes: number;
}

function TimeTrackerItem({
  // endAt,
  last = false,
  percentage,
  // startAt,
  note,
  workDurationInMinutes,
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
            {/* <div className="whitespace-nowrap space-x-2 text-sm">
              <time dateTime={startAt}>
                {dayjs(startAt).format("MMM D, YYYY HH:mm")}
              </time>
              <span>-</span>
              <time dateTime={endAt}>
                {dayjs(endAt).format("MMM D, YYYY HH:mm")}
              </time>
            </div> */}
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
          <p className="font-semibold">
            {workDurationInMinutes}
            min
          </p>
        </div>
      </div>
    </div>
  );
}
