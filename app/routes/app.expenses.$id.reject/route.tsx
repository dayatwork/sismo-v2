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
import { getExpenseById, rejectExpense } from "~/services/expense.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const expenseId = params.id;
  if (!expenseId) {
    return redirect(`/app/expenses`);
  }

  const loggedInUser = await requirePermission(request, "manage:finance");

  await rejectExpense({
    expenseId,
    rejectedById: loggedInUser.id,
  });

  return redirectWithToast(`/app/expenses`, {
    description: `Expense rejected`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const expenseId = params.id;
  if (!expenseId) {
    return redirect(`/app/expenses`);
  }

  await requirePermission(request, "manage:finance");

  const expense = await getExpenseById({
    expenseId,
  });

  if (!expense) {
    return redirect(`/app/expenses`);
  }

  return json({ expense });
}

export default function RejectExpense() {
  const { expense } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/expenses`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Reject expense
          </Heading>
          <p className="my-4">Are you sure to reject this expense?</p>
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
              onClick={() => navigate(`/app/expenses`)}
            >
              Cancel
            </Button>
            <Button
              disabled={expense.code !== confirmText || submitting}
              type="submit"
              variant="destructive"
            >
              {submitting ? "Rejecting" : "Reject"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
