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
  closeMeetingByRoomName,
  getOpenedMeetingByRoomName,
} from "~/services/meeting.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const roomName = params.room;
  if (!roomName) {
    return redirect(`/app/${organizationId}/meetings`);
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

  await closeMeetingByRoomName({ organizationId, roomName });

  return redirectWithToast(`/app/${organizationId}/meetings`, {
    description: `Meeting close`,
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
    return redirect(`/app/${organizationId}/meetings`);
  }

  const meeting = await getOpenedMeetingByRoomName({ roomName });

  if (!meeting) {
    return redirect(`/app/${organizationId}/meetings`);
  }

  return json({ meeting });
}

export default function CloseMeetingRoom() {
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
      onOpenChange={() => navigate(`/app/${orgId}/iam/users`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Close Meeting
          </Heading>
          <p className="my-4">Are you sure to close this meeting?</p>
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
              onClick={() => navigate(`/app/${orgId}/iam/users`)}
            >
              Cancel
            </Button>
            <Button
              disabled={meeting.roomName !== confirmText || submitting}
              variant="destructive"
              type="submit"
            >
              {submitting ? "Closing" : "Close Meeting"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
