import { Form, useNavigate, useNavigation } from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requireUser } from "~/utils/auth.server";
import { emitter } from "~/utils/sse/emitter.server";
import { deleteTaskTracker } from "~/services/task-tracker.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const trackerId = params.id;
  if (!trackerId) {
    return redirect(`/app/time-tracker`);
  }

  const loggedInUser = await requireUser(request);

  await deleteTaskTracker({
    trackerId,
    ownerId: loggedInUser.id,
  });

  emitter.emit(`tracker-${loggedInUser.id}-changed`);

  return redirectWithToast(`/app/time-tracker`, {
    description: `Tracker deleted`,
    type: "success",
  });
}

export default function DeleteTimeTracker() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/time-tracker`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Tracker
          </Heading>
          <p className="mt-2 mb-4">Are you sure to delete this tracker?</p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/time-tracker`)}
            >
              Cancel
            </Button>
            <Button variant="destructive" type="submit" disabled={submitting}>
              {submitting ? "Deleting" : "Delete"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
