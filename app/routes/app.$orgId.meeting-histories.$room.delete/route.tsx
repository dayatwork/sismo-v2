import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { Input } from "~/components/ui/input";
import { requirePermission } from "~/utils/auth.server";
import {
  deleteClosedMeetingByRoomName,
  getClosedMeetingByRoomName,
} from "~/services/meeting.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const roomName = params.room;
  if (!roomName) {
    return redirect(`/app/${organizationId}/meeting-histories`);
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:meeting"
  );
  if (!loggedInUser) {
    return redirectWithToast(`/app/${organizationId}/dashboard`, {
      description: "Forbidden",
      type: "error",
    });
  }

  await deleteClosedMeetingByRoomName({ organizationId, roomName });

  return redirectWithToast(`/app/${organizationId}/meetings`, {
    description: `Meeting deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const roomName = params.room;
  if (!roomName) {
    return redirect(`/app/${organizationId}/meeting-histories`);
  }

  const meeting = await getClosedMeetingByRoomName({ roomName });

  if (!meeting || meeting.status === "OPEN") {
    return redirect(`/app/${organizationId}/meeting-histories`);
  }

  return json({ meeting });
}

export default function DeleteMeetingRoom() {
  const { meeting } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/meeting-histories`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Meeting
          </Heading>
          <p className="my-4">Are you sure to delete this meeting?</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{meeting.roomName}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/meeting-histories`)}
            >
              Cancel
            </Button>
            <Button
              disabled={meeting.roomName !== confirmText || submitting}
              variant="destructive"
              type="submit"
            >
              {submitting ? "Deleting" : "Delete"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
