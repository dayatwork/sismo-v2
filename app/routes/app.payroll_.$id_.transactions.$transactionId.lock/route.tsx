import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";

import { lockPayrollTransaction } from "../../services/payroll.server";

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

  await requirePermission(request, "manage:payroll");

  await lockPayrollTransaction({ transactionId });

  return redirectWithToast(
    `/app/payroll/${payrollId}/transactions/${transactionId}`,
    {
      description: `Transaction Locked`,
      type: "success",
    }
  );
}

export default function LockTransaction() {
  const navigate = useNavigate();
  const { id, transactionId } = useParams<{
    id: string;
    transactionId: string;
  }>();

  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

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
            Lock Payroll Transaction
          </Heading>
          <p className="my-4">{`Are you sure to lock transaction?`}</p>
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
            <Button
              disabled={submitting}
              variant="outline"
              className="bg-green-600 hover:bg-green-700"
              type="submit"
            >
              {submitting ? "Locking" : "Lock"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
