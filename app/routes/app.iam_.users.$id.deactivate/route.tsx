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
import { deactivateUser, getUserById } from "~/services/user.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = params.id;
  if (!userId) {
    return redirect(`/app/iam/users`);
  }

  await requirePermission(request, "manage:iam");

  await deactivateUser(userId);

  return redirectWithToast(`/app/iam/users/${userId}`, {
    description: `User deactivated`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = params.id;
  if (!userId) {
    return redirect(`/app/iam/users`);
  }

  await requirePermission(request, "manage:iam");

  const user = await getUserById(userId);

  if (!user) {
    return redirect(`/app/iam/users`);
  }

  return json({ user });
}

export default function DeactivateOrganizationUser() {
  const { user } = useLoaderData<typeof loader>();
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
              onClick={() => navigate(`/app/iam/users`)}
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
