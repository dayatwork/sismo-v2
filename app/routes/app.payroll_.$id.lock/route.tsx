import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";

import { lockPayroll } from "../../services/payroll.server";

// TODO: HANDLE LOCKED ITEM
export async function action({ request, params }: ActionFunctionArgs) {
  const payrollId = params.id;
  if (!payrollId) {
    return redirect("/app/payroll");
  }

  await requirePermission(request, "manage:payroll");

  try {
    await lockPayroll({ payrollId });

    return redirectWithToast(`/app/payroll/${payrollId}`, {
      description: `Payroll Locked`,
      type: "success",
    });
  } catch (error: any) {
    return redirectWithToast(`/app/payroll/${payrollId}`, {
      description: `Failed to lock payroll. ${error.message}`,
      type: "error",
    });
  }
}

export default function LockPayroll() {
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
            Lock Payroll
          </Heading>
          <p className="my-4">{`Are you sure to lock this payroll?`}</p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/payroll/${id}`)}
            >
              Cancel
            </Button>
            <Button
              disabled={submitting}
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
