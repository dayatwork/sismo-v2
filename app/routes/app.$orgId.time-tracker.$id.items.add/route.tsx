import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import {
  json,
  type LoaderFunctionArgs,
  redirect,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { Modal, Dialog, Button, Heading } from "react-aria-components";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";
import dayjs from "dayjs";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { requireOrganizationUser } from "~/utils/auth.server";
import {
  addTrackerItems,
  getUserTimeTrackerById,
} from "~/services/time-tracker.server";
import { getUnfinishedTasks } from "~/services/task.server";
import {
  RAComboBox,
  RAComboBoxItem,
} from "~/components/ui/react-aria/combobox";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { emitter } from "~/utils/sse/emitter.server";

const schema = z.object({
  taskId: z.string().min(1, "Required"),
  taskCompletion: zfd.numeric(
    z.number({ required_error: "Required" }).min(0).max(100)
  ),
  workDurationInMinutes: zfd.numeric(
    z.number({ required_error: "Required" }).min(0)
  ),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const timeTrackerId = params.id;
  if (!timeTrackerId) {
    return redirect(`/app/${organizationId}/time-tracker`);
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), errorWorkDuration: null });
  }

  const { taskCompletion, taskId, workDurationInMinutes } = submission.value;

  const tracker = await getUserTimeTrackerById({
    trackerId: timeTrackerId,
    userId: loggedInUser.id,
  });

  if (!tracker) {
    return redirect(`/app/${organizationId}/time-tracker`);
  }

  const MAX_WORKING_TIMES =
    dayjs(tracker.endAt).diff(tracker.startAt, "minutes") -
    tracker.trackerItems.reduce(
      (acc, curr) => acc + curr.workDurationInMinutes,
      0
    );

  if (workDurationInMinutes > MAX_WORKING_TIMES) {
    return json({
      submission,
      errorWorkDuration: `Maximum ${MAX_WORKING_TIMES} minutes`,
    });
  }

  await addTrackerItems({
    trackerItems: [
      { taskCompletion, taskId, timeTrackerId, workDurationInMinutes },
    ],
    organizationId,
    userId: loggedInUser.id,
  });

  emitter.emit(`tracker-${loggedInUser.id}-changed`);

  return redirect(`/app/${organizationId}/time-tracker/${timeTrackerId}/items`);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const trackerId = params.id;
  if (!trackerId) {
    return redirect(`/app/${organizationId}/time-tracker`);
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);

  if (!loggedInUser) {
    return redirect("/app");
  }

  const tracker = await getUserTimeTrackerById({
    trackerId,
    userId: loggedInUser.id,
  });

  if (!tracker) {
    return redirect(`/app/${organizationId}/time-tracker`);
  }

  const excludeIds = tracker.trackerItems.map((item) => item.taskId);

  const tasks = await getUnfinishedTasks({
    assigneeId: loggedInUser.id,
    organizationId,
    excludeIds,
  });

  return json({ tracker, tasks });
}

export default function AddTaskToTracker() {
  const actionData = useActionData<typeof action>();
  const { tracker, tasks } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId, id } = useParams<{ orgId: string; id: string }>();

  const MAX_WORKING_TIMES =
    dayjs(tracker.endAt).diff(tracker.startAt, "minutes") -
    tracker.trackerItems.reduce(
      (acc, curr) => acc + curr.workDurationInMinutes,
      0
    );

  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/time-tracker/${id}/items`)}
      className="overflow-hidden w-full max-w-xl -mt-32"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <div className="flex justify-between items-center mb-6">
          <Heading slot="title" className="text-lg font-semibold">
            Add Task to Tracker
          </Heading>
          <div className="font-semibold px-3 py-1 rounded-md border">
            Max : {MAX_WORKING_TIMES} min
          </div>
        </div>
        <Form method="POST" id={form.id} onSubmit={form.onSubmit}>
          <div className="space-y-4">
            <div className="grid gap-2">
              <RAComboBox
                className="flex-1"
                name="taskId"
                label="Task"
                items={tasks}
                defaultSelectedKey=""
                placeholder="Search task..."
              >
                {(task) => (
                  <RAComboBoxItem id={task.id} textValue={task.name}>
                    <p className="font-semibold">{task.name}</p>
                    <p className="text-muted-foreground">
                      {task.project?.name || "-"}
                    </p>
                  </RAComboBoxItem>
                )}
              </RAComboBox>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.taskId.errors}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="grid gap-2">
                <Label>Completion</Label>
                <div className="relative">
                  <Input
                    name="taskCompletion"
                    type="number"
                    min={0}
                    max={100}
                    className="text-right pr-8 font-semibold"
                    defaultValue={fields.taskCompletion.initialValue}
                  />
                  <span className="absolute top-2 font-semibold right-3 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                  {fields.taskCompletion.errors}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Working Duration</Label>
                <div className="relative">
                  <Input
                    name="workDurationInMinutes"
                    type="number"
                    min={0}
                    className="text-right pr-12 font-semibold"
                    defaultValue={fields.workDurationInMinutes.initialValue}
                  />
                  <span className="absolute top-2 font-semibold right-3 text-sm text-muted-foreground">
                    min
                  </span>
                </div>
                <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                  {fields.workDurationInMinutes.errors ||
                    actionData?.errorWorkDuration}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-2">
            <Button
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/${orgId}/time-tracker/${id}/items`)}
            >
              Close
            </Button>
            <Button type="submit" className={cn(buttonVariants())}>
              Submit
            </Button>
          </div>
        </Form>
        {/* <ul className="mt-4 border p-1"></ul> */}
      </Dialog>
    </Modal>
  );
}
