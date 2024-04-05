import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import { labelVariants } from "~/components/ui/label";
import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";
import { createNewPayrollTransactionItem } from "~/services/payroll.server";

const schema = z.object({
  amount: z.number().min(0),
  note: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const payrollId = params.id;
  if (!payrollId) {
    return redirect("/app/payrolls");
  }
  const transactionId = params.transactionId;
  if (!transactionId) {
    return redirect(`/app/payrolls/${payrollId}`);
  }

  await requirePermission(request, "manage:payroll");
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), error: null });
  }

  const { amount, note } = submission.value;

  try {
    await createNewPayrollTransactionItem({
      amount,
      note,
      transactionId,
      type: "WAGE",
    });
    return redirectWithToast(
      `/app/payroll/${payrollId}/transactions/${transactionId}`,
      {
        description: `New item added`,
        type: "success",
      }
    );
  } catch (error: any) {
    return json({ submission, error: error.message });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:payroll");

  return null;
}

export default function AddNewTransactionWage() {
  const actionData = useActionData<typeof action>();
  const { id, transactionId } = useParams<{
    id: string;
    transactionId: string;
  }>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() =>
        navigate(`/app/payroll/${id}/transactions/${transactionId}`)
      }
      className="overflow-hidden w-full max-w-sm"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Heading slot="title" className="text-lg font-semibold">
          Add New Wage
        </Heading>
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount" className={labelVariants()}>
                Amount (Rp)
              </Label>
              <Input
                id="amount"
                type="number"
                name="amount"
                defaultValue={fields.amount.initialValue}
              />
              {fields.amount.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.amount.errors}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="note" className={labelVariants()}>
                  Note
                </Label>
                <span className="text-sm text-muted-foreground leading-none">
                  (optional)
                </span>
              </div>
              <Textarea
                id="note"
                name="note"
                defaultValue={fields.note.initialValue}
              />

              {fields.note.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.note.errors}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() =>
                navigate(`/app/payroll/${id}/transactions/${transactionId}`)
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(buttonVariants())}
              isDisabled={submitting}
            >
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
