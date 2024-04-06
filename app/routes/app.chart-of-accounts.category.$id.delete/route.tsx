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
  deleteCoaCategory,
  getCoaCategoryById,
} from "~/services/chart-of-account.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const categoryId = params.id;
  if (!categoryId) {
    return redirect(`/app/chart-of-accounts`);
  }

  await requirePermission(request, "manage:finance");

  await deleteCoaCategory({ categoryId });

  return redirectWithToast(`/app/chart-of-accounts/category`, {
    description: `COA category deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const categoryId = params.id;
  if (!categoryId) {
    return redirect(`/app/chart-of-accounts/category`);
  }
  await requirePermission(request, "manage:finance");

  const coaCategory = await getCoaCategoryById({
    categoryId,
  });

  if (!coaCategory) {
    return redirect(`/app/chart-of-accounts/category`);
  }

  return json({ coaCategory });
}

export default function DeleteAccountCategory() {
  const { coaCategory } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/chart-of-accounts/category`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Account Category
          </Heading>
          <p className="my-4">
            Are you sure to delete account category "{coaCategory.name}"?
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{coaCategory.name}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/chart-of-accounts/category`)}
            >
              Cancel
            </Button>
            <Button
              disabled={coaCategory.name !== confirmText || submitting}
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
