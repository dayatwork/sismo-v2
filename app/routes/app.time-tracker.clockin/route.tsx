import { Form, useNavigate, useNavigation } from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Modal, Dialog, Button, Heading } from "react-aria-components";

import { buttonVariants } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { emitter } from "~/utils/sse/emitter.server";
import { requireUser } from "~/utils/auth.server";
import { getSettings } from "~/services/setting.server";
import {
  getNumberOfInCompleteTrackers,
  startTracker,
} from "~/services/task-tracker.server";
import { getUnfinishedBoardTasks } from "~/services/board.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const loggedInUser = await requireUser(request);

  if (!loggedInUser) {
    return redirect("/app");
  }

  try {
    await startTracker({
      ownerId: loggedInUser.id,
    });

    emitter.emit(`tracker-${loggedInUser.id}-changed`);
    emitter.emit(`employee-work-status-change`);

    return redirectWithToast(`/app/time-tracker`, {
      description: `Tracker started!`,
      type: "success",
    });
  } catch (error: any) {
    return redirectWithToast(`/app/time-tracker/clockin`, {
      description: error.message || "Something went wrong",
      type: "error",
    });
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const totalInCompleteTrackers = await getNumberOfInCompleteTrackers({
    ownerId: loggedInUser.id,
  });

  if (totalInCompleteTrackers) {
    return redirect(`/app/time-tracker`);
  }

  const tasks = await getUnfinishedBoardTasks({
    ownerId: loggedInUser.id,
  });

  const settings = await getSettings();

  return json({ tasks, settings });
}

export default function TimeTrackerClockin() {
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
          Clock in
        </Heading>
        <p className="mb-6">Are you sure to clock in?</p>
        <Form method="POST" className="flex justify-end gap-2">
          <Button
            className={cn(buttonVariants({ variant: "ghost" }))}
            onPress={() => navigate(`/app/time-tracker`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={cn(buttonVariants())}
            isDisabled={submitting}
          >
            {submitting ? "Clocking in" : "Clock in"}
          </Button>
        </Form>
      </Dialog>
    </Modal>
  );
}
