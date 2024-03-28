import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import {
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";
import { restoreWorkspace } from "~/services/workspace.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect(`/app/workspaces`);
  }

  await requirePermission(request, "manage:workspace");

  await restoreWorkspace({ id: workspaceId });

  return redirectWithToast(`/app/workspaces/${workspaceId}`, {
    description: `Workspace restored`,
    type: "success",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:workspace");

  return null;
}

export default function RestoreWorkspace() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { id } = useParams<{ id: string }>();
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
            Restore Workspace
          </Heading>
          <p className="mt-2 mb-4">Are you sure to restore this workspace?</p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/workspaces/${id}`)}
            >
              Cancel
            </Button>
            <Button variant="destructive" type="submit" disabled={submitting}>
              {submitting ? "Restoring" : "Restore"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
