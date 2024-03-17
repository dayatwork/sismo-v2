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
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { Modal, Dialog, Button, Heading } from "react-aria-components";
import { useForm } from "@conform-to/react";
import {
  parseAbsoluteToLocal,
  parseZonedDateTime,
} from "@internationalized/date";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { requireOrganizationUser } from "~/utils/auth.server";
import {
  editTimeTracker,
  getUserTimeTrackerById,
} from "~/services/time-tracker.server";
import { RADatePicker } from "~/components/ui/react-aria/datepicker";
import { emitter } from "~/utils/sse/emitter.server";

const schema = z.object({
  startAt: z.any(),
  endAt: z.any(),
});

export async function action({ request, params }: ActionFunctionArgs) {
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

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json({ submission, errorTime: null });
  }

  const { startAt, endAt } = submission.value;

  const formattedStartAt =
    parseZonedDateTime(startAt).toAbsoluteString() || undefined;
  const formattedEndAt =
    parseZonedDateTime(endAt).toAbsoluteString() || undefined;

  if (formattedStartAt && formattedEndAt) {
    if (
      new Date(formattedStartAt).getTime() > new Date(formattedEndAt).getTime()
    ) {
      return json({
        submission,
        errorTime: "End time should greater than start time",
      });
    }
  }

  await editTimeTracker({
    trackerId,
    startAt: formattedStartAt,
    endAt: formattedEndAt,
    organizationId,
    userId: loggedInUser.id,
  });

  emitter.emit(`tracker-${loggedInUser.id}-changed`);

  return redirect(`/app/${organizationId}/time-tracker`);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  console.log("HIT");
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

  return json({ tracker });
}

export default function EditTimeTracker() {
  const actionData = useActionData<typeof action>();
  const { tracker } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, { endAt, startAt }] = useForm({
    lastSubmission: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate: ({ formData }) => {
      return parse(formData, { schema });
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
      onOpenChange={() => navigate(`/app/${orgId}/time-tracker`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" {...form.props}>
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
                startAt.defaultValue
                  ? parseAbsoluteToLocal(startAt.defaultValue)
                  : undefined
              }
            />
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {startAt.error}
            </p>
            <RADatePicker
              label="End at"
              name="endAt"
              granularity="second"
              hourCycle={24}
              defaultValue={
                endAt.defaultValue
                  ? parseAbsoluteToLocal(endAt.defaultValue)
                  : undefined
              }
            />
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {endAt.errors || actionData?.errorTime}
            </p>
          </div>
          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/${orgId}time-tracker`)}
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
