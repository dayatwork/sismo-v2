import { useLoaderData, useNavigate } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Modal, Dialog } from "react-aria-components";
import dayjs from "dayjs";

import { requireUser } from "~/utils/auth.server";
import prisma from "~/lib/prisma";
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
import { AlertTriangle } from "lucide-react";
import { TimeTrackerItem } from "./time-tracker-item";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const taskId = params.taskId;
  const loggedInUser = await requireUser(request);

  const task = await prisma.boardTask.findUnique({
    where: { id: taskId },
    include: {
      group: { select: { id: true, name: true } },
      board: { include: { workspace: { select: { id: true, name: true } } } },
      trackerItems: {
        include: { tracker: true, attachments: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (task?.ownerId !== loggedInUser.id) {
    return redirect("/app/dashboard");
  }

  return json({ task, appUrl: process.env.APP_URL || "http://localhost:5173" });
}

export default function DashboardTaskProgress() {
  const { task, appUrl } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const durationInMinutes = task.trackerItems.reduce((acc, curr) => {
    const duration = dayjs(curr.tracker.endAt).diff(
      curr.tracker.startAt,
      "minute"
    );
    return acc + duration;
  }, 0);

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/dashboard`)}
      className="overflow-hidden w-full max-w-5xl"
    >
      <Dialog className="bg-background border rounded-xl p-6 outline-none">
        <div className="flex items-center gap-10">
          <h1 className="text-xl font-semibold">{task.name}</h1>
          {task.timelineEnd && new Date() > new Date(task.timelineEnd) && (
            <div className="flex gap-1.5 items-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-semibold">{`${dayjs().diff(
                task.timelineEnd,
                "day"
              )} days past due`}</p>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-2">
          <dl className="space-y-4 text-sm">
            <div className="flex items-center">
              <dt className="w-52 text-muted-foreground">Workspace</dt>
              <dd>{task.board?.workspace.name || "-"}</dd>
            </div>
            <div className="flex items-center">
              <dt className="w-52 text-muted-foreground">Board</dt>
              <dd>{task.board?.name || "-"}</dd>
            </div>
            <div className="flex items-center">
              <dt className="w-52 text-muted-foreground">Task Group</dt>
              <dd>{task.group?.name || ""}</dd>
            </div>
            <div className="flex items-center">
              <dt className="w-52 text-muted-foreground">Priority</dt>
              <dd className="flex items-center gap-2">
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
                {task.priority.replace("_", " ")}
              </dd>
            </div>
            <div className="flex items-center">
              <dt className="w-52 text-muted-foreground">Status</dt>
              <dd className="flex items-center gap-2">
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
              </dd>
            </div>
            <div className="flex items-center">
              <dt className="w-52 text-muted-foreground">Timeline Start</dt>
              <dd>
                {task.timelineStart
                  ? new Date(task.timelineStart).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "medium",
                    })
                  : "-"}
              </dd>
            </div>
            <div className="flex items-center">
              <dt className="w-52 text-muted-foreground">Timeline End</dt>
              <dd>
                {task.timelineEnd
                  ? new Date(task.timelineEnd).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "medium",
                    })
                  : "-"}
              </dd>
            </div>
            <div className="flex items-center">
              <dt className="w-52 text-muted-foreground">
                Target Completion Time
              </dt>
              <dd>{task.plannedEffortInMinutes} minutes</dd>
            </div>
          </dl>
          <div>
            <h3 className="font-semibold mb-6">Trackers</h3>
            {task.trackerItems.length > 0 ? (
              <>
                <ul>
                  {task.trackerItems
                    .filter((trackerItem) => Boolean(trackerItem.tracker.endAt))
                    .map((trackerItem, index) => (
                      <li key={trackerItem.id}>
                        <TimeTrackerItem
                          last={task.trackerItems.length - 1 === index}
                          percentage={trackerItem.taskCompletion}
                          startAt={trackerItem.tracker.startAt}
                          endAt={trackerItem.tracker.endAt!}
                          note={trackerItem.note}
                          appUrl={appUrl}
                          attachments={trackerItem.attachments}
                        />
                      </li>
                    ))}
                </ul>
                <div className="flex justify-end mt-10">
                  <p className="border px-3 py-1 rounded-md">
                    <span className="text-muted-foreground">
                      Total Duration
                    </span>{" "}
                    :{" "}
                    <span className="ml-1 font-semibold">
                      {Math.floor(durationInMinutes / 60)}{" "}
                      <span className="font-normal text-muted-foreground text-base">
                        hours
                      </span>{" "}
                      {durationInMinutes % 60}{" "}
                      <span className="font-normal text-muted-foreground text-base">
                        minutes
                      </span>
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center border border-dashed h-32 rounded-xl">
                <p>No trackers</p>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </Modal>
  );
}
