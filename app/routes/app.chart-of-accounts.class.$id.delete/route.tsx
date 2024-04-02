import { useState } from "react";
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

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { Input } from "~/components/ui/input";
import { requirePermission } from "~/utils/auth.server";
import {
  deleteCoaClass,
  getCoaClassById,
} from "~/services/chart-of-account.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const classId = params.id;
  if (!classId) {
    return redirect(`/app/chart-of-accounts`);
  }

  await requirePermission(request, "manage:finance");

  await deleteCoaClass({ classId });

  return redirectWithToast(`/app/chart-of-accounts/class`, {
    description: `COA class deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const classId = params.id;
  if (!classId) {
    return redirect(`/app/chart-of-accounts/class`);
  }
  await requirePermission(request, "manage:finance");

  const coaClass = await getCoaClassById({
    classId,
  });

  if (!coaClass) {
    return redirect(`/app/chart-of-accounts/class`);
  }

  return json({ coaClass });
}

export default function DeleteChartOfAccountClass() {
  const { coaClass } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/chart-of-accounts/class`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete chart of account class
          </Heading>
          <p className="my-4">
            Are you sure to delete COA class "{coaClass.name}"?
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{coaClass.name}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/chart-of-accounts/class`)}
            >
              Cancel
            </Button>
            <Button
              disabled={coaClass.name !== confirmText || submitting}
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
