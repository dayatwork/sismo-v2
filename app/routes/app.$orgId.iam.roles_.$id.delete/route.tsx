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
import { deleteRole, getRoleById } from "~/services/role.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const roleId = params.id;
  if (!roleId) {
    return redirect(`/app/${organizationId}/iam/roles`);
  }

  // const user = await requiredPermission(request, "manage:role");
  // if (!user) {
  //   return redirectWithToast(`/app/dashboard`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  await deleteRole({ id: roleId, organizationId });

  return redirectWithToast(`/app/${organizationId}/iam/roles`, {
    description: `Role deleted`,
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

  // const user = await requiredPermission(request, "manage:role");
  // if (!user) {
  //   return redirectWithToast(`/app/dashboard`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  const role = await getRoleById({ id: roleId, organizationId });

  if (!role) {
    return redirect(`/app/${organizationId}/iam/roles`);
  }

  return json({ role });
}

export default function DeleteRole() {
  const { role } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/iam/roles`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Role
          </Heading>
          <p className="my-4">Are you sure to delete the "{role.name}"?</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{role.name}</span>" to confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/iam/roles`)}
            >
              Cancel
            </Button>
            <Button
              disabled={role.name !== confirmText || submitting}
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
