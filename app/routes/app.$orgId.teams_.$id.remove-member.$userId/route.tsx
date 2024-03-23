import {
  Form,
  useNavigate,
  useNavigation,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { Input } from "~/components/ui/input";
import { requirePermission } from "~/utils/auth.server";

import { type loader as teamIdLoader } from "../app.$orgId.teams_.$id/route";
import { removeTeamMembers } from "~/services/team.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const teamId = params.id;
  const userId = params.userId;
  if (!teamId || !userId) {
    return redirect(`/app/${organizationId}/teams`);
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:team"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  await removeTeamMembers({
    teamId,
    organizationId,
    members: [{ userId }],
  });

  return redirectWithToast(`/app/${organizationId}/teams/${teamId}`, {
    description: `Member removed`,
    type: "success",
  });
}

export default function RemoveMember() {
  const loaderData = useRouteLoaderData<typeof teamIdLoader>(
    "routes/app.$orgId.teams_.$id"
  );

  const navigate = useNavigate();
  const { orgId, id, userId } = useParams<{
    orgId: string;
    id: string;
    userId: string;
  }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const teamName = loaderData?.team.name || "";
  const userName =
    loaderData?.team.teamMembers.find((tm) => tm.userId === userId)?.user
      .name || "";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/teams/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Remove member
          </Heading>
          <p className="my-4">
            {`Are you sure to remove ${userName} from ${teamName}?`}
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{userName}</span>" to confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/teams/${id}`)}
            >
              Cancel
            </Button>
            <Button
              disabled={userName !== confirmText || submitting}
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
