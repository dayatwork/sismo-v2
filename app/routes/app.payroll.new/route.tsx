import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import { labelVariants } from "~/components/ui/label";
import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";
import { createPayroll } from "~/services/payroll.server";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { MonthComboBox } from "~/components/comboboxes/month-combobox";

const months = [
  { name: "January", id: "1" },
  { name: "February", id: "2" },
  { name: "March", id: "3" },
  { name: "April", id: "4" },
  { name: "May", id: "5" },
  { name: "June", id: "6" },
  { name: "July", id: "7" },
  { name: "August", id: "8" },
  { name: "September", id: "9" },
  { name: "October", id: "10" },
  { name: "November", id: "11" },
  { name: "December", id: "12" },
];

const schema = z.object({
  month: z.enum([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ]),
  year: z.number().int().min(2024).max(2030),
  type: z.enum(["MONTHLY_SALARY", "RELIGIOUS_HOLIDAY_ALLOWANCE"]),
});

export async function action({ request }: ActionFunctionArgs) {
  await requirePermission(request, "manage:payroll");
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), error: null });
  }

  const { month, type, year } = submission.value;

  try {
    const payroll = await createPayroll({ month: +month, type, year });
    return redirectWithToast(`/app/payroll/${payroll.id}`, {
      description: `New payroll created`,
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

export default function NewPayroll() {
  const actionData = useActionData<typeof action>();
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
      onOpenChange={() => navigate(`/app/payroll`)}
      className="overflow-hidden w-full max-w-sm"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Heading slot="title" className="text-lg font-semibold">
          New Payroll
        </Heading>
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="type" className={labelVariants()}>
                Type of payroll
              </Label>
              <RadioGroup
                name="type"
                className="grid grid-cols-2 gap-4"
                defaultValue="MONTHLY_SALARY"
              >
                <div>
                  <RadioGroupItem
                    value="MONTHLY_SALARY"
                    id="MONTHLY_SALARY"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="MONTHLY_SALARY"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-sky-600/10 hover:text-accent-foreground peer-data-[state=checked]:border-sky-600 [&:has([data-state=checked])]:border-sky-600 font-semibold"
                  >
                    Monthly Salary
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="RELIGIOUS_HOLIDAY_ALLOWANCE"
                    id="RELIGIOUS_HOLIDAY_ALLOWANCE"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="RELIGIOUS_HOLIDAY_ALLOWANCE"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-pink-600/10 hover:text-accent-foreground peer-data-[state=checked]:border-pink-600 [&:has([data-state=checked])]:border-pink-600 font-semibold"
                  >
                    THR
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <MonthComboBox
                  name="month"
                  months={months}
                  defaultValue={(new Date().getMonth() + 1).toString()}
                />
                <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                  {fields.month.errors}
                </p>
              </div>
              <div className="grid gap-2">
                <div className="space-y-1">
                  <Label htmlFor="year" className={cn(labelVariants())}>
                    Year
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    name="year"
                    defaultValue={new Date().getFullYear()}
                  />
                </div>
                {fields.year.errors ? (
                  <p
                    role="alert"
                    className="text-sm font-semibold text-red-600"
                  >
                    {fields.year.errors}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/payroll`)}
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
