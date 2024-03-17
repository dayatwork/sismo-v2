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
import {
  deactivateOrganizationUser,
  getOrganizationUser,
} from "~/services/user.server";
import { requirePermission } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const userId = params.id;
  if (!userId) {
    return redirect(`/app/${organizationId}/iam/users`);
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:iam"
  );
  if (!loggedInUser) {
    return redirectWithToast(`/app/${organizationId}/dashboard`, {
      description: "Forbidden",
      type: "error",
    });
  }

  // const user = await requiredPermission(request, "manage:role");
  // if (!user) {
  //   return redirectWithToast(`/app/dashboard`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  await deactivateOrganizationUser({ userId, organizationId });

  return redirectWithToast(`/app/${organizationId}/iam/users`, {
    description: `User deactivated`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const userId = params.id;
  if (!userId) {
    return redirect(`/app/${organizationId}/iam/users`);
  }

  const organizationUser = await getOrganizationUser({
    organizationId,
    userId,
  });

  if (!organizationUser) {
    return redirect(`/app/${organizationId}/iam/users`);
  }

  console.log({ organizationUser });

  return json({ user: organizationUser.user });
}

export default function DeactivateOrganizationUser() {
  const { user } = useLoaderData<typeof loader>();
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
            Deactivate User
          </Heading>
          <p className="my-4">Are you sure to deactivate user "{user.name}"?</p>
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
              onClick={() => navigate(`/app/${orgId}/iam/users`)}
            >
              Cancel
            </Button>
            <Button
              disabled={user.name !== confirmText || submitting}
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {submitting ? "Deactivating" : "Deactivate"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
