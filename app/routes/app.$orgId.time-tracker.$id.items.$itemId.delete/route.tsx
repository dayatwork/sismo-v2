import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { deleteTrackerItem } from "~/services/time-tracker.server";
import { requireOrganizationUser } from "~/utils/auth.server";
import { emitter } from "~/utils/sse/emitter.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const trackerId = params.id;
  const trackerItemId = params.itemId;
  if (!trackerId || !trackerItemId) {
    return redirect(`/app/${organizationId}/time-tracker`);
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);

  if (!loggedInUser) {
    return redirect("/app");
  }

  await deleteTrackerItem({
    id: trackerItemId,
    userId: loggedInUser.id,
    organizationId,
  });

  emitter.emit(`tracker-${loggedInUser.id}-changed`);

  return redirectWithToast(
    `/app/${organizationId}/time-tracker/${trackerId}/items`,
    {
      description: `Task deleted from tracker`,
      type: "success",
    }
  );
}

export default function DeleteTrackerItem() {
  const navigate = useNavigate();
  const { orgId, id } = useParams<{ id: string; orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/time-tracker/${id}/items`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Task
          </Heading>
          <p className="mt-2 mb-4">
            Are you sure to delete this task from tracker?
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/time-tracker/${id}/items`)}
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
