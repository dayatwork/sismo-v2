import { Form, useNavigate, useNavigation } from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Modal, Dialog, Button, Heading } from "react-aria-components";

import { buttonVariants } from "~/components/ui/button";
import { requireUser } from "~/utils/auth.server";
import { emitter } from "~/utils/sse/emitter.server";
import { cn } from "~/lib/utils";
import {
  getTaskTrackerByOwnerId,
  stopTracker,
} from "~/services/task-tracker.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const trackerId = params.id;
  if (!trackerId) {
    return redirect(`/app/time-tracker`);
  }

  const loggedInUser = await requireUser(request);

  await stopTracker({
    trackerId,
    ownerId: loggedInUser.id,
  });

  emitter.emit(`tracker-${loggedInUser.id}-changed`);
  emitter.emit(`employee-work-status-change`);

  return redirect(`/app/time-tracker`);
}

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

  if (!tracker || tracker.endAt) {
    return redirect(`/app/time-tracker`);
  }

  return json({ tracker });
}

export default function StopTimeTracker() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/time-tracker`)}
      className="overflow-hidden w-full max-w-lg"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Heading slot="title" className="text-lg font-semibold mb-4">
          Stop Tracker
        </Heading>
        <p className="mb-6">Are you sure to stop the tracker?</p>
        <Form method="POST" className="flex justify-end gap-2">
          <Button className={cn(buttonVariants({ variant: "ghost" }))}>
            Cancel
          </Button>
          <Button
            type="submit"
            className={cn(buttonVariants())}
            isDisabled={submitting}
          >
            {submitting ? "Clocking out" : "Clock out"}
          </Button>
        </Form>
      </Dialog>
    </Modal>
  );
}
