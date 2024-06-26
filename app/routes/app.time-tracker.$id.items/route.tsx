import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { json, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Button, Heading } from "react-aria-components";
import dayjs from "dayjs";
import { PenSquare, Plus, Trash2 } from "lucide-react";

import { buttonVariants } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { requireUser } from "~/utils/auth.server";
import { cn } from "~/lib/utils";
import { getTaskTrackerByOwnerId } from "~/services/task-tracker.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const trackerId = params.id;
  if (!trackerId) {
    return redirect(`/app/time-tracker`);
  }

  const loggedInUser = await requireUser(request);

  const tracker = await getTaskTrackerByOwnerId({
    trackerId,
    ownerId: loggedInUser.id,
  });

  if (!tracker) {
    return redirect(`/app/time-tracker`);
  }

  return json({ tracker });
}

export default function SetTrackerItems() {
  const { tracker } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const assignDuration = tracker.trackerItems.reduce(
    (acc, curr) => acc + curr.workDurationInMinutes,
    0
  );
  const totalDuration = dayjs(tracker.endAt).diff(tracker.startAt, "minutes");

  return (
    <>
      <Modal
        isDismissable
        isOpen={true}
        onOpenChange={() => navigate(`/app/time-tracker`)}
        className="overflow-hidden w-full max-w-3xl"
      >
        <Dialog className="bg-background border rounded-md p-6 outline-none">
          <div className="flex justify-between items-center">
            <Heading slot="title" className="text-lg font-semibold">
              Tracker Tasks
            </Heading>
            <div className="px-3 py-1 border rounded-md font-semibold space-x-1">
              <span
                className={cn(
                  assignDuration === totalDuration && "text-green-600",
                  assignDuration === 0 && "text-red-600",
                  assignDuration > 0 &&
                    assignDuration < totalDuration &&
                    "text-orange-600"
                )}
              >
                {assignDuration}
              </span>
              <span>/</span>
              <span>{totalDuration} minutes</span>
            </div>
          </div>
          {tracker.trackerItems.length === 0 ? (
            <p className="mt-4 text-muted-foreground text-center py-6 bg-neutral-50 dark:bg-neutral-900 rounded-md text-sm">
              No task attach to this tracker
            </p>
          ) : (
            <Table className="bg-neutral-50 dark:bg-neutral-900 rounded mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Task</TableHead>
                  <TableHead className="w-32">Completion</TableHead>
                  <TableHead className="w-32">Work Duration</TableHead>
                  <TableHead className="w-28">
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracker.trackerItems.map((trackerItem) => (
                  <TableRow key={trackerItem.id} className="group">
                    <TableCell className="pl-4">
                      {trackerItem.task.name}
                      <span className="block text-xs text-muted-foreground">
                        {trackerItem.note}
                      </span>
                    </TableCell>
                    <TableCell className="w-32">
                      {trackerItem.taskCompletion}%
                    </TableCell>
                    <TableCell className="w-32">
                      {trackerItem.workDurationInMinutes} min
                    </TableCell>
                    <TableCell className="w-28">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 justify-end">
                        <Button
                          className={buttonVariants({
                            variant: "outline",
                            size: "icon",
                          })}
                          onPress={() => navigate(`${trackerItem.id}/edit`)}
                        >
                          <span className="sr-only">Edit</span>
                          <PenSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          className={buttonVariants({
                            variant: "outline",
                            size: "icon",
                            className: "text-red-600",
                          })}
                          onPress={() => navigate(`${trackerItem.id}/delete`)}
                        >
                          <span className="sr-only">Delete</span>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="mt-6 flex justify-between">
            {totalDuration !== assignDuration || assignDuration === 0 ? (
              <Button
                className={cn(buttonVariants({ variant: "outline" }))}
                onPress={() => navigate("add")}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Task
              </Button>
            ) : (
              <div />
            )}
            <Button
              className={cn(buttonVariants())}
              onPress={() => navigate(`/app/time-tracker`)}
            >
              Close
            </Button>
          </div>
        </Dialog>
      </Modal>
      <Outlet />
    </>
  );
}
