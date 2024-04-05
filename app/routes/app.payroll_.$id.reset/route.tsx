import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";

import {
  generatePayrollTransactionForAllUsers,
  getPayrollById,
} from "~/services/payroll.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const payrollId = params.id;
  if (!payrollId) {
    return redirect("/app/payroll");
  }

  await requirePermission(request, "manage:payroll");

  const payroll = await getPayrollById({ payrollId });
  if (!payroll) {
    return redirect("/app/payroll");
  }

  if (payroll.locked) {
    return redirectWithToast(`/app/payroll/${payrollId}`, {
      description: `Cannot reset locked payroll`,
      type: "error",
    });
  }

  try {
    await generatePayrollTransactionForAllUsers({ payrollId });

    return redirectWithToast(`/app/payroll/${payrollId}`, {
      description: `Payroll Reset`,
      type: "success",
    });
  } catch (error: any) {
    return redirectWithToast(`/app/payroll/${payrollId}`, {
      description: `Failed to reset payroll. ${error.message}`,
      type: "error",
    });
  }
}

export default function ResetPayroll() {
  const navigate = useNavigate();
  const { id } = useParams<{
    id: string;
  }>();

  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/payroll/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Reset Payroll
          </Heading>
          <p className="mt-4 mb-2">{`Are you sure to reset payroll?`}</p>
          <p>This action also reset locked transactions.</p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/payroll/${id}`)}
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
