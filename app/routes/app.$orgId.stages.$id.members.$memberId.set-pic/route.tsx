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
import { authenticator } from "~/services/auth.server";
import {
  getStageMemberById,
  setStageMemberAsPic,
} from "~/services/stage.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });

  const stageId = params.id;
  const memberId = params.memberId;

  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  if (!memberId) {
    return redirect(`/app/${organizationId}/stages/${stageId}/members`);
  }

  await setStageMemberAsPic({ memberId, stageId });

  return redirectWithToast(`/app/${organizationId}/stages/${stageId}/members`, {
    description: `New PIC set`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });
  const stageId = params.id;
  const memberId = params.memberId;

  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  if (!memberId) {
    return redirect(`/app/${organizationId}/stages/${stageId}/member`);
  }

  const member = await getStageMemberById({ memberId });

  if (!member) {
    return redirect(`/app/stages/${stageId}/member`);
  }

  return json({ member });
}
// TODO: Add authorization

export default function RemoveStageMember() {
  const { member } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const { id, orgId } = useParams<{ id: string; orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/stages/${id}/members`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Set PIC
          </Heading>
          <p className="my-4">Are you sure to set {member.user.name} as PIC</p>
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
              onClick={() => navigate(`/app/${orgId}/stages/${id}/members`)}
            >
              Cancel
            </Button>
            <Button
              disabled={member.user.name !== confirmText || submitting}
              type="submit"
            >
              {submitting ? "Setting PIC" : "Set as PIC"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
