import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { Modal, Dialog, Button, Heading } from "react-aria-components";
import { useForm } from "@conform-to/react";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useState } from "react";
import { Label, labelVariants } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  editTrackerItem,
  getPreviousTaskTracker,
  getTrackerItemById,
  getUserTimeTrackerById,
} from "~/services/time-tracker.server";
import { emitter } from "~/utils/sse/emitter.server";
import { Input } from "~/components/ui/input";
import { zfd } from "zod-form-data";
import dayjs from "dayjs";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  taskCompletion: zfd.numeric(z.number().min(0).max(100)),
  workDurationInMinutes: zfd.numeric(z.number().min(0)),
  note: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const trackerId = params.id;
  const trackerItemId = params.itemId;
  if (!trackerId || !trackerItemId) {
    return redirect(`/app/time-tracker`);
  }

  const loggedInUser = await requireUser(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), errorWorkDuration: null });
  }

  const { taskCompletion, note, workDurationInMinutes } = submission.value;

  const tracker = await getUserTimeTrackerById({
    trackerId,
    userId: loggedInUser.id,
  });

  if (!tracker) {
    return redirect(`/app/time-tracker`);
  }

  const MAX_WORKING_TIMES =
    dayjs(tracker.endAt).diff(tracker.startAt, "minutes") -
    tracker.trackerItems
      .filter((trackerItem) => trackerItem.id !== trackerItemId)
      .reduce((acc, curr) => acc + curr.workDurationInMinutes, 0);

  if (workDurationInMinutes > MAX_WORKING_TIMES) {
    return json({
      submission,
      errorWorkDuration: `Maximum ${MAX_WORKING_TIMES} minutes`,
    });
  }

  await editTrackerItem({
    id: trackerItemId,
    taskCompletion,
    note: note || "",
    userId: loggedInUser.id,
    workDurationInMinutes,
  });

  emitter.emit(`tracker-${loggedInUser.id}-changed`);

  return redirect(`/app/time-tracker/${trackerId}/items`);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const trackerId = params.id;
  const trackerItemId = params.itemId;
  if (!trackerId || !trackerItemId) {
    return redirect(`/app/time-tracker`);
  }

  const loggedInUser = await requireUser(request);

  if (!loggedInUser) {
    return redirect("/app");
  }

  // const tracker = await getUserTimeTrackerById({
  //   trackerId,
  //   userId: loggedInUser.id,
  // });
  const trackerItem = await getTrackerItemById({ id: trackerItemId });

  if (!trackerItem) {
    return redirect(`/app/time-tracker/${trackerId}/items`);
  }

  const previousTaskTracker = await getPreviousTaskTracker({
    currentTrackerItemCompletion: trackerItem.taskCompletion,
    currentTrackerItemId: trackerItem.id,
    taskId: trackerItem.taskId,
  });

  return json({ trackerItem, previousTaskTracker });
}

export default function EditTrackerItem() {
  const actionData = useActionData<typeof action>();
  const { trackerItem, previousTaskTracker } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId, id } = useParams<{ orgId: string; id: string }>();
  const [progress, setProgress] = useState(trackerItem.taskCompletion || 0);
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema });
    },
    defaultValue: {
      note: trackerItem.note,
      workDurationInMinutes: trackerItem.workDurationInMinutes,
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/time-tracker/${id}/items`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Edit Tracker
          </Heading>
          <div className="mt-6 grid gap-2">
            <Label>Working Duration</Label>
            <div className="inline-flex">
              <div className="relative">
                <Input
                  name="workDurationInMinutes"
                  type="number"
                  min={0}
                  className="w-32 text-right pr-12 font-semibold"
                  defaultValue={fields.workDurationInMinutes.initialValue}
                />
                <span className="absolute top-2 font-semibold right-3 text-sm text-muted-foreground">
                  min
                </span>
              </div>
            </div>
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {fields.workDurationInMinutes.errors ||
                actionData?.errorWorkDuration}
            </p>
          </div>
          <div className="mt-6">
            <dt className={labelVariants()}>Task Completion</dt>
            <dd className="relative">
              <span
                className="absolute font-semibold text-xs -translate-x-2"
                style={{ left: `${progress}%` }}
              >
                {progress}%
              </span>
            </dd>
            <Progress className="mt-6" value={progress} />

            <div className="mt-4 grid grid-cols-4 gap-4">
              <Button
                onPress={() =>
                  setProgress(previousTaskTracker?.taskCompletion || 0)
                }
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                Reset
              </Button>
              <Button
                onPress={() =>
                  setProgress((prev) => (prev - 10 > 0 ? prev - 10 : 0))
                }
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
                isDisabled={progress <= 0}
              >
                -10%
              </Button>
              <Button
                onPress={() =>
                  setProgress((prev) => (prev + 10 < 100 ? prev + 10 : 100))
                }
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
                isDisabled={progress >= 100}
              >
                +10%
              </Button>
              <Button
                onPress={() => setProgress(100)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
                isDisabled={progress === 100}
              >
                100%
              </Button>
            </div>
            <input type="hidden" name="taskCompletion" value={progress} />
          </div>
          <div className="mt-6 grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="note">Note</Label>
              <span className="text-sm text-muted-foreground leading-none">
                optional
              </span>
            </div>
            <Textarea
              id="note"
              name="note"
              defaultValue={fields.note.initialValue}
            />
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {fields.note.errors}
            </p>
          </div>
          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/${orgId}/time-tracker/${id}/items`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(buttonVariants())}
              isDisabled={submitting}
            >
              {submitting ? "Saving" : "Save"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
