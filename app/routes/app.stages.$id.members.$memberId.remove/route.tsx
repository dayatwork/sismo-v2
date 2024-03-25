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
import { getStageMemberById, removeStageMember } from "~/services/stage.server";
import { requireUser } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  const memberId = params.memberId;

  if (!stageId) {
    return redirect(`/app/projects`);
  }

  if (!memberId) {
    return redirect(`/app/stages/${stageId}/members`);
  }

  await removeStageMember({ memberId });

  return redirectWithToast(`/app/stages/${stageId}/members`, {
    description: `Member remove`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  const memberId = params.memberId;

  if (!stageId) {
    return redirect(`/app/projects`);
  }

  if (!memberId) {
    return redirect(`/app/stages/${stageId}/member`);
  }

  const member = await getStageMemberById({ memberId });

  if (!member) {
    return redirect(`/app/stages/${stageId}/member`);
  }

  return json({ member });
}

export default function RemoveStageMember() {
  const { member } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const { id } = useParams<{ id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/stages/${id}/members`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Remove Member
          </Heading>
          <p className="my-4">
            Are you sure to remove {member.user.name} from {member.stage.name}{" "}
            stage
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{member.user.name}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/stages/${id}/members`)}
            >
              Cancel
            </Button>
            <Button
              disabled={member.user.name !== confirmText || submitting}
              variant="destructive"
              type="submit"
            >
              {submitting ? "Removing" : "Remove"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
