import {
  Form,
  useNavigate,
  useNavigation,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";

import { deletePayrollTransactionItem } from "~/services/payroll.server";
import { type loader as transactionLoader } from "../app.payroll_.$id_.transactions.$transactionId/route";

// TODO: HANDLE LOCKED ITEM
export async function action({ request, params }: ActionFunctionArgs) {
  const payrollId = params.id;
  if (!payrollId) {
    return redirect("/app/payroll");
  }

  const transactionId = params.transactionId;
  if (!transactionId) {
    return redirect(`/app/payroll/${payrollId}`);
  }

  const transactionItemId = params.itemId;
  if (!transactionItemId) {
    return redirect(`/app/payroll/${payrollId}/transactions/${transactionId}`);
  }

  await requirePermission(request, "manage:payroll");

  await deletePayrollTransactionItem({ id: transactionItemId, transactionId });

  return redirectWithToast(
    `/app/payroll/${payrollId}/transactions/${transactionId}`,
    {
      description: `Item deleted`,
      type: "success",
    }
  );
}

export default function DeleteTransactionItem() {
  const loaderData = useRouteLoaderData<typeof transactionLoader>(
    "routes/app.payroll_.$id_.transactions.$transactionId"
  );

  const navigate = useNavigate();
  const { id, transactionId, itemId } = useParams<{
    id: string;
    transactionId: string;
    itemId: string;
  }>();

  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const selectedItem = loaderData?.payrollTransaction.transactionItems.find(
    (item) => item.id === itemId
  )?.note;

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() =>
        navigate(`/app/payroll/${id}/transactions/${transactionId}`)
      }
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Remove Item
          </Heading>
          <p className="my-4">{`Are you sure to remove ${selectedItem}?`}</p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                navigate(`/app/payroll/${id}/transactions/${transactionId}`)
              }
            >
              Cancel
            </Button>
            <Button disabled={submitting} variant="destructive" type="submit">
              {submitting ? "Deleting" : "Delete"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
