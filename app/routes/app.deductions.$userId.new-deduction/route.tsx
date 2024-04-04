import {
  Form,
  Navigate,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
  useRouteLoaderData,
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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Switch } from "~/components/ui/switch";
import { DeductionComboBox } from "~/components/comboboxes/deduction-combobox";
import { cn } from "~/lib/utils";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";
import { createDeduction } from "~/services/deduction.server";
import { type loader as deductionsLoader } from "../app.deductions/route";

const schema = z.object({
  nameId: z.string(),
  amount: z.number().min(0),
  fixed: z.boolean(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = params.userId;
  if (!userId) {
    return redirect("/app/deductions");
  }

  await requirePermission(request, "manage:payroll");
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), error: null });
  }

  const { amount, nameId, fixed } = submission.value;

  try {
    await createDeduction({
      amount,
      fixed,
      nameId,
      userId,
    });
    return redirectWithToast(`/app/deductions`, {
      description: `Deduction added`,
      type: "success",
    });
  } catch (error: any) {
    return json({ submission, error: error.message });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:payroll");

  return null;
}

export default function NewDeduction() {
  const actionData = useActionData<typeof action>();
  const deductionsData = useRouteLoaderData<typeof deductionsLoader>(
    "routes/app.deductions"
  );
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const selectedUser = deductionsData?.usersWithDeductions.find(
    (user) => user.id === userId
  );

  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  if (!selectedUser) {
    return <Navigate to="/app/deductions" />;
  }

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/deductions`)}
      className="overflow-hidden w-full max-w-sm"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Heading slot="title" className="text-lg font-semibold">
          New Deduction
        </Heading>
        <div className="mt-4 p-2 rounded-lg border flex items-center gap-2">
          <Avatar>
            <AvatarImage src={selectedUser.photo || ""} />
            <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{selectedUser.name}</span>
        </div>
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <DeductionComboBox
                name="nameId"
                errorMessage={
                  fields.nameId.errors?.length
                    ? fields.nameId.errors.toString()
                    : undefined
                }
                deduction={deductionsData?.deductionNames || []}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount" className={labelVariants()}>
                Amount
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  defaultValue={fields.amount.initialValue}
                />
                <span className="font-semibold whitespace-nowrap text-sm text-muted-foreground">
                  / month
                </span>
              </div>
              {fields.amount.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.amount.errors}
                </p>
              ) : null}
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Switch
                id="fixed"
                name="fixed"
                defaultChecked={fields.fixed.initialValue === "on"}
              />
              <Label htmlFor="fixed" className={labelVariants()}>
                Fixed
              </Label>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/deductions`)}
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
