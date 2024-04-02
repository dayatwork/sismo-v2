import { useState } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  Modal,
  Dialog,
  Select,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Heading,
} from "react-aria-components";
import { Prisma } from "@prisma/client";
import { ChevronDownIcon } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { selectClassName } from "~/components/ui/select";
import { buttonVariants } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";
import { cn } from "~/lib/utils";
import { getChartOfAccounts } from "~/services/chart-of-account.server";
import { createJournal } from "~/services/journal.server";

const schema = z.object({
  chartOfAccountId: z.string(),
  referenceNumber: z.string(),
  amount: z.string().min(1, "Required"),
  currency: z.enum(["IDR", "USD"]),
  description: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const loggedInUser = await requirePermission(request, "manage:finance");

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { chartOfAccountId, currency, description, amount, referenceNumber } =
    submission.value;

  await createJournal({
    amount: new Prisma.Decimal(amount),
    currency,
    createdById: loggedInUser.id,
    description,
    chartOfAccountId,
    referenceNumber,
    date: new Date().toISOString(),
  });

  return redirectWithToast(`/app/journals`, {
    description: `New journal added`,
    type: "success",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const chartOfAccounts = await getChartOfAccounts();

  return json({ chartOfAccounts });
}

export default function AddNewJournal() {
  const lastResult = useActionData<typeof action>();
  const { chartOfAccounts } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [currency, setCurrency] = useState<string>("IDR");

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/journals`)}
      className="overflow-hidden w-full max-w-lg"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold mb-4">
            Add New Journal
          </Heading>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select name="chartOfAccountId">
                <Label>Chart of Account</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-md">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    {chartOfAccounts.map((coa) => (
                      <ListBoxItem
                        key={coa.id}
                        id={coa.id}
                        value={{ id: coa.id }}
                        className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                      >
                        {coa.code} - {coa.type.name} - {coa.accountName}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.chartOfAccountId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                autoFocus
                name="referenceNumber"
                min={0}
                defaultValue={fields.referenceNumber.initialValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.referenceNumber.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Select
                name="currency"
                selectedKey={currency}
                onSelectionChange={(value) => setCurrency(value.toString())}
              >
                <Label>Currency</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-md">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    <ListBoxItem
                      key="IDR"
                      id="IDR"
                      value={{ id: "IDR" }}
                      className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                    >
                      IDR (Indonesian Rupiah)
                    </ListBoxItem>
                    <ListBoxItem
                      key="USD"
                      id="USD"
                      value={{ id: "USD" }}
                      className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                    >
                      USD (US Dollar)
                    </ListBoxItem>
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.currency.errors}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  autoFocus
                  name="amount"
                  type="number"
                  className="pl-8"
                />
                <span className="absolute top-[8px] left-2.5 text-sm font-semibold">
                  {currency === "IDR" ? "Rp" : currency === "USD" ? "$" : ""}
                </span>
              </div>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.amount.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="note">Description</Label>
                <span className="text-sm text-muted-foreground leading-none">
                  optional
                </span>
              </div>
              <Textarea
                id="description"
                name="description"
                defaultValue={fields.description.initialValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.description.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/journals`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={buttonVariants()}
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
