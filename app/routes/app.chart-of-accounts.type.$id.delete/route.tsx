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
import {
  deleteCoaType,
  getCoaTypeById,
} from "~/services/chart-of-account.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const typeId = params.id;
  if (!typeId) {
    return redirect(`/app/chart-of-accounts`);
  }

  await requirePermission(request, "manage:finance");

  await deleteCoaType({ typeId });

  return redirectWithToast(`/app/chart-of-accounts/type`, {
    description: `COA type deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const typeId = params.id;
  if (!typeId) {
    return redirect(`/app/chart-of-accounts/type`);
  }

  await requirePermission(request, "manage:finance");

  const coaType = await getCoaTypeById({
    typeId,
  });

  if (!coaType) {
    return redirect(`/app/chart-of-accounts/type`);
  }

  return json({ coaType });
}

export default function DeleteChartOfAccountType() {
  const { coaType } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/chart-of-accounts/type`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete chart of account type
          </Heading>
          <p className="my-4">
            Are you sure to delete COA type "{coaType.name}"?
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{coaType.name}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/chart-of-accounts/type`)}
            >
              Cancel
            </Button>
            <Button
              disabled={coaType.name !== confirmText || submitting}
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
