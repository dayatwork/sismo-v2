import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
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
  const roomName = params.room;
  if (!roomName) {
    return redirect(`/app/meetings`);
  }

  await requirePermission(request, "manage:meeting");

  await closeMeetingByRoomName({ roomName });

  return redirectWithToast(`/app/meetings`, {
    description: `Meeting close`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const roomName = params.room;
  if (!roomName) {
    return redirect(`/app/meetings`);
  }

  const meeting = await getOpenedMeetingByRoomName({ roomName });

  if (!meeting) {
    return redirect(`/app/meetings`);
  }

  return json({ meeting });
}

export default function CloseMeetingRoom() {
  const { meeting } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/iam/users`)}
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
              onClick={() => navigate(`/app/iam/users`)}
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
