import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";

import { resetPayrollTransaction } from "~/services/payroll.server";

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

  await resetPayrollTransaction({ transactionId, payrollId });

  return redirectWithToast(
    `/app/payroll/${payrollId}/transactions/${transactionId}`,
    {
      description: `Transaction Reset`,
      type: "success",
    }
  );
}

export default function ResetTransaction() {
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
            Reset Payroll Transaction
          </Heading>
          <p className="my-4">{`Are you sure to reset transaction?`}</p>
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
              {submitting ? "Reseting" : "Reset"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
