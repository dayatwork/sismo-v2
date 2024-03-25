import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
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
import {
  parseAbsoluteToLocal,
  parseZonedDateTime,
} from "@internationalized/date";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { requireUser } from "~/utils/auth.server";
import {
  editTimeTracker,
  getUserTimeTrackerById,
} from "~/services/time-tracker.server";
import { RADatePicker } from "~/components/ui/react-aria/datepicker";
import { emitter } from "~/utils/sse/emitter.server";

const schema = z.object({
  startAt: z
    .string()
    .transform((dt) => parseZonedDateTime(dt).toDate())
    .pipe(z.date()),
  endAt: z
    .string()
    .transform((dt) => parseZonedDateTime(dt).toDate())
    .pipe(z.date()),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const trackerId = params.id;
  if (!trackerId) {
    return redirect(`/app/time-tracker`);
  }

  const loggedInUser = await requireUser(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), errorTime: null });
  }

  const { startAt, endAt } = submission.value;

  if (startAt.getTime() > endAt.getTime()) {
    return json({
      submission,
      errorTime: "End time should greater than start time",
    });
  }

  await editTimeTracker({
    trackerId,
    startAt,
    endAt,
    userId: loggedInUser.id,
  });

  emitter.emit(`tracker-${loggedInUser.id}-changed`);

  return redirect(`/app/time-tracker`);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const trackerId = params.id;
  if (!trackerId) {
    return redirect(`/app/time-tracker`);
  }

  const loggedInUser = await requireUser(request);

  const tracker = await getUserTimeTrackerById({
    trackerId,
    userId: loggedInUser.id,
  });

  if (!tracker) {
    return redirect(`/app/time-tracker`);
  }

  return json({ tracker });
}

export default function EditTimeTracker() {
  const actionData = useActionData<typeof action>();
  const { tracker } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema });
    },
    defaultValue: {
      startAt: tracker.startAt,
      endAt: tracker.endAt,
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/time-tracker`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Edit Tracker
          </Heading>
          <div className="space-y-4 mt-6">
            <RADatePicker
              label="Start at"
              name="startAt"
              granularity="second"
              hourCycle={24}
              defaultValue={
                fields.startAt.initialValue
                  ? parseAbsoluteToLocal(fields.startAt.initialValue)
                  : undefined
              }
            />
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {fields.startAt.errors}
            </p>
            <RADatePicker
              label="End at"
              name="endAt"
              granularity="second"
              hourCycle={24}
              defaultValue={
                fields.endAt.initialValue
                  ? parseAbsoluteToLocal(fields.endAt.initialValue)
                  : undefined
              }
            />
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {fields.endAt.errors || actionData?.errorTime}
            </p>
          </div>
          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/apptime-tracker`)}
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
