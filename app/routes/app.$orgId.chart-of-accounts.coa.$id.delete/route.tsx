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
import { requirePermission } from "~/utils/auth.server";
import {
  deleteChartOfAccount,
  getChartOfAccountById,
} from "~/services/chart-of-account.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const chartOfAccountId = params.id;
  if (!chartOfAccountId) {
    return redirect(`/app/${organizationId}/chart-of-accounts`);
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:finance"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  await deleteChartOfAccount({ organizationId, chartOfAccountId });

  return redirectWithToast(`/app/${organizationId}/chart-of-accounts`, {
    description: `Chart of account deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const chartOfAccountId = params.id;
  if (!chartOfAccountId) {
    return redirect(`/app/${organizationId}/chart-of-accounts/coa`);
  }

  const chartOfAccount = await getChartOfAccountById({
    chartOfAccountId,
    organizationId,
  });

  if (!chartOfAccount) {
    return redirect(`/app/${organizationId}/chart-of-accounts/coa`);
  }

  return json({ chartOfAccount });
}
// TODO: Add authorization

export default function DeleteChartOfAccount() {
  const { chartOfAccount } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/chart-of-accounts/coa`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete chart of account
          </Heading>
          <p className="my-4">
            Are you sure to delete chart of account "
            {chartOfAccount.accountName}"?
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{chartOfAccount.code}</span>"
            to confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/chart-of-accounts/coa`)}
            >
              Cancel
            </Button>
            <Button
              disabled={chartOfAccount.code !== confirmText || submitting}
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
