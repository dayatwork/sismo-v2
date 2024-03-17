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
import { getRoleById, removeRoleFromUser } from "~/services/role.server";
import { getUserById } from "~/services/user.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const roleId = params.id;
  if (!roleId) {
    return redirect(`/app/${organizationId}/iam/roles`);
  }

  const userId = params.userId;
  if (!userId) {
    return redirect(`/app/${organizationId}/iam/roles/${roleId}`);
  }

  // const user = await requiredPermission(request, "manage:role");
  // if (!user) {
  //   return redirectWithToast(`/app/dashboard`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  await removeRoleFromUser({ organizationId, roleId, userId });

  return redirectWithToast(`/app/${organizationId}/iam/roles/${roleId}`, {
    description: `User removed`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const roleId = params.id;
  if (!roleId) {
    return redirect(`/app/${organizationId}/iam/roles`);
  }

  const userId = params.userId;
  if (!userId) {
    return redirect(`/app/${organizationId}/iam/roles/${roleId}`);
  }

  // const user = await requiredPermission(request, "manage:role");
  // if (!user) {
  //   return redirectWithToast(`/app/dashboard`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  const [role, user] = await Promise.all([
    getRoleById({ id: roleId, organizationId }),
    getUserById(userId),
  ]);

  if (!role) {
    return redirect(`/app/${organizationId}/iam/roles`);
  }

  if (!user) {
    return redirect(`/app/${organizationId}/iam/roles/${roleId}`);
  }

  return json({ role, user });
}

export default function RemoveUserFromRole() {
  const { role, user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId, id } = useParams<{ orgId: string; id: string }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/iam/roles/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Remove User
          </Heading>
          <p className="my-4">
            Are you sure to remove user "{user.name}" from role "{role.name}"?
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{user.name}</span>" to confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/iam/roles/${id}`)}
            >
              Cancel
            </Button>
            <Button
              disabled={user.name !== confirmText || submitting}
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
