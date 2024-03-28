import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import {
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import {
  removeWorkspaceRoles,
  requireWorkspacePermission,
} from "~/services/workspace.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect(`/app/workspaces`);
  }

  const roleId = params.roleId;
  if (!roleId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  await requireWorkspacePermission(request, workspaceId, "manage:permission");

  await removeWorkspaceRoles({
    workspaceId,
    roleIds: [roleId],
  });

  return redirectWithToast(`/app/workspaces/${workspaceId}`, {
    description: `Member removed`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect(`/app/workspaces`);
  }

  await requireWorkspacePermission(request, workspaceId, "manage:permission");

  return null;
}

export default function RemoveWorkspaceRole() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
            Remove Workspace Role
          </Heading>
          <p className="mt-4 mb-2">
            Are you sure to remove this role from workspace?
          </p>

          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/workspaces/${id}`)}
            >
              Cancel
            </Button>
            <Button disabled={submitting} variant="destructive" type="submit">
              {submitting ? "Removing" : "Remove"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
