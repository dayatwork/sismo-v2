import {
  Form,
  useNavigate,
  useNavigation,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import {
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
import { hardDeleteWorkspace } from "~/services/workspace.server";
import { type loader as workspaceIdLoader } from "../app.workspaces_.$id/route";

export async function action({ request, params }: ActionFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect(`/app/workspaces`);
  }

  await requirePermission(request, "manage:workspace");

  await hardDeleteWorkspace({ id: workspaceId });

  return redirectWithToast(`/app/workspaces`, {
    description: `Workspace deleted`,
    type: "success",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:workspace");

  return null;
}

export default function DeleteWorkspace() {
  const routeloaderData = useRouteLoaderData<typeof workspaceIdLoader>(
    "routes/app.workspaces_.$id"
  );
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/workspaces/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Workspace
          </Heading>
          <p className="mt-4 mb-2">
            Are you sure to delete workspace "{routeloaderData?.workspace.name}
            "?
          </p>
          <p className="text-red-600 font-semibold mb-2">
            This action cannot be undone!
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "
            <span className="font-semibold">
              {routeloaderData?.workspace.name}
            </span>
            " to confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/workspaces/${id}`)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                routeloaderData?.workspace.name !== confirmText || submitting
              }
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
