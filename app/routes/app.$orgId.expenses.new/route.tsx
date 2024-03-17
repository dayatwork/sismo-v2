import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
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
import { zfd } from "zod-form-data";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { Textarea } from "~/components/ui/textarea";
import { requirePermission } from "~/utils/auth.server";
import { cn } from "~/lib/utils";
import { selectClassName } from "~/components/ui/select";
import { buttonVariants } from "~/components/ui/button";
import { submitExpense } from "~/services/expense.server";
import { getChartOfAccounts } from "~/services/chart-of-account.server";
import { useState } from "react";

const schema = z.object({
  chartOfAccountId: z.string(),
  code: z.string(),
  projectId: z.string().optional(),
  stageId: z.string().optional(),
  quantity: zfd.numeric(z.number().gte(1)),
  unitPrice: z.string().min(1, "Required"),
  currency: z.enum(["IDR", "USD"]),
  note: z.string().optional(),
  description: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:finance"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const {
    chartOfAccountId,
    currency,
    quantity,
    unitPrice,
    note,
    projectId,
    stageId,
    description,
    code,
  } = submission.value;

  await submitExpense({
    amount: new Prisma.Decimal(unitPrice).times(quantity),
    currency,
    quantity,
    submittedById: loggedInUser.id,
    note,
    projectId,
    stageId,
    organizationId,
    unitPrice: new Prisma.Decimal(unitPrice),
    description,
    chartOfAccountId,
    code,
  });

  return redirectWithToast(`/app/${organizationId}/expenses`, {
    description: `New expenses submitted`,
    type: "success",
  });
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:finance"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  const chartOfAccounts = await getChartOfAccounts({ organizationId });

  return json({ chartOfAccounts });
}

export default function SubmitNewExpense() {
  const lastSubmission = useActionData<typeof action>();
  const { chartOfAccounts } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [currency, setCurrency] = useState<string>("IDR");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/expenses`)}
      className="overflow-hidden w-full max-w-lg"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold mb-4">
            Submit New Expense
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
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                autoFocus
                name="code"
                min={0}
                defaultValue={fields.code.defaultValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.code.errors}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <div className="relative">
                  <Input
                    id="unitPrice"
                    autoFocus
                    name="unitPrice"
                    type="number"
                    min={0}
                    className="pl-8"
                    defaultValue={fields.unitPrice.defaultValue}
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                  <span className="absolute top-[8px] left-2.5 text-sm font-semibold">
                    {currency === "IDR" ? "Rp" : currency === "USD" ? "$" : ""}
                  </span>
                </div>
                <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                  {fields.unitPrice.errors}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  autoFocus
                  name="quantity"
                  type="number"
                  min={0}
                  defaultValue={fields.quantity.defaultValue}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                  {fields.quantity.errors}
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <Input
                  readOnly
                  id="amount"
                  autoFocus
                  name="amount"
                  type="number"
                  className="pl-8"
                  value={
                    !!quantity && !!unitPrice
                      ? String(Number(quantity) * Number(unitPrice))
                      : ""
                  }
                />
                <span className="absolute top-[8px] left-2.5 text-sm font-semibold">
                  {currency === "IDR" ? "Rp" : currency === "USD" ? "$" : ""}
                </span>
              </div>
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
                defaultValue={fields.description.defaultValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.description.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="note">Note</Label>
                <span className="text-sm text-muted-foreground leading-none">
                  optional
                </span>
              </div>
              <Textarea
                id="note"
                name="note"
                defaultValue={fields.note.defaultValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.note.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/${orgId}/expenses`)}
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
