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
import { approveExpense, getExpenseById } from "~/services/expense.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const expenseId = params.id;
  if (!expenseId) {
    return redirect(`/app/${organizationId}/expenses`);
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:finance"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  await approveExpense({
    organizationId,
    expenseId,
    approvedById: loggedInUser.id,
  });

  return redirectWithToast(`/app/${organizationId}/expenses`, {
    description: `Expense approved`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const expenseId = params.id;
  if (!expenseId) {
    return redirect(`/app/${organizationId}/expenses`);
  }

  const expense = await getExpenseById({
    expenseId,
    organizationId,
  });

  if (!expense) {
    return redirect(`/app/${organizationId}/expenses`);
  }

  return json({ expense });
}
// TODO: Add authorization

export default function ApproveExpense() {
  const { expense } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/expenses`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Approve expense
          </Heading>
          <p className="my-4">Are you sure to approve this expense?</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{expense.code}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/expenses`)}
            >
              Cancel
            </Button>
            <Button
              disabled={expense.code !== confirmText || submitting}
              type="submit"
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Approving" : "Approve"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
