import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";

import { lockPayroll } from "../../services/payroll.server";
import { createJournalEntry } from "~/services/journal.server";
import { Prisma } from "@prisma/client";

// TODO: HANDLE LOCKED ITEM
export async function action({ request, params }: ActionFunctionArgs) {
  const payrollId = params.id;
  if (!payrollId) {
    return redirect("/app/payroll");
  }

  await requirePermission(request, "manage:payroll");

  try {
    const payroll = await lockPayroll({ payrollId });
    const totalAmount = payroll.transactions.reduce(
      (acc, curr) => acc + curr.total,
      0
    );

    await createJournalEntry({
      referenceNumber: `PR-${payroll.id}`,
      date: new Date(),
      description: `Payroll ${payroll.month} ${payroll.year}`,
      entryLines: [
        {
          type: "DEBIT",
          accountId: "31c2423e-0743-45e9-9203-3b34d39a4d39",
          amount: new Prisma.Decimal(totalAmount),
        },
        {
          type: "CREDIT",
          accountId: "bbb3e52b-4467-44d5-8e15-fca48e5a0b08",
          amount: new Prisma.Decimal(totalAmount),
        },
      ],
    });

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
