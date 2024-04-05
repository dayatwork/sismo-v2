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
  redirect,
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
  Label,
} from "react-aria-components";

import { Input } from "~/components/ui/input";
import { labelVariants } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { Textarea } from "~/components/ui/textarea";
import { requirePermission } from "~/utils/auth.server";
import {
  editChartOfAccount,
  getChartOfAccountById,
  getCoaClasses,
  getCoaTypes,
} from "~/services/chart-of-account.server";
import { cn } from "~/lib/utils";
import { selectClassName } from "~/components/ui/select";
import { ChevronDownIcon } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";

const schema = z.object({
  typeId: z.string(),
  code: z.string(),
  accountName: z.string(),
  description: z.string().optional(),
  openingBalance: z.number(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const chartOfAccountId = params.id;
  if (!chartOfAccountId) {
    return redirect(`/app/chart-of-accounts`);
  }

  await requirePermission(request, "manage:finance");

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { accountName, code, typeId, description, openingBalance } =
    submission.value;

  await editChartOfAccount({
    chartOfAccountId,
    accountName,
    code,
    typeId,
    description,
    openingBalance,
  });

  return redirectWithToast(`/app/chart-of-accounts/coa`, {
    description: `Chart of account edited`,
    type: "success",
  });
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const chartOfAccountId = params.id;
  if (!chartOfAccountId) {
    return redirect(`/app/chart-of-accounts/coa`);
  }

  await requirePermission(request, "manage:finance");

  const chartOfAccount = await getChartOfAccountById({
    chartOfAccountId,
  });
  if (!chartOfAccount) {
    return redirect(`/app/chart-of-accounts/coa`);
  }

  const [coaClasses, coaTypes] = await Promise.all([
    getCoaClasses(),
    getCoaTypes(),
  ]);

  return json({ chartOfAccount, coaClasses, coaTypes });
}

export default function EditChartOfAccount() {
  const lastResult = useActionData<typeof action>();
  const { chartOfAccount, coaClasses, coaTypes } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [classId, setClassId] = useState(chartOfAccount.type.classId);

  const filteredTypesOptions = classId
    ? coaTypes.filter((type) => type.classId === classId)
    : coaTypes;

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    defaultValue: {
      typeId: chartOfAccount.typeId,
      code: chartOfAccount.code,
      accountName: chartOfAccount.accountName,
      description: chartOfAccount.description,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/chart-of-accounts/coa`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold mb-4">
            Edit Chart of Account
          </Heading>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select
                name="classId"
                selectedKey={classId}
                onSelectionChange={(v) => setClassId(v.toString())}
              >
                <Label className={cn(labelVariants())}>Select Class</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 outline-none bg-neutral-50 dark:bg-neutral-900">
                    {coaClasses.map((coaClass) => (
                      <ListBoxItem
                        key={coaClass.id}
                        id={coaClass.id}
                        value={{ id: coaClass.id }}
                        className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                      >
                        {coaClass.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
            </div>
            <div className="grid gap-2">
              <Select
                name="typeId"
                isDisabled={!classId}
                defaultSelectedKey={chartOfAccount.typeId}
              >
                <Label className={cn(labelVariants())}>Select Type</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 outline-none bg-neutral-50 dark:bg-neutral-900">
                    {filteredTypesOptions.map((coaType) => (
                      <ListBoxItem
                        key={coaType.id}
                        id={coaType.id}
                        value={{ id: coaType.id }}
                        className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                      >
                        {coaType.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.typeId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code" className={cn(labelVariants())}>
                Code
              </Label>
              <Input
                id="code"
                autoFocus
                name="code"
                defaultValue={fields.code.initialValue}
                className="w-[200px]"
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.code.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accountName" className={cn(labelVariants())}>
                Account Name
              </Label>
              <Input
                id="accountName"
                autoFocus
                name="accountName"
                defaultValue={fields.accountName.initialValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.accountName.errors}
              </p>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description" className={cn(labelVariants())}>
                  Description
                </Label>
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
              <div className="grid gap-2">
                <Label htmlFor="openingBalance" className={cn(labelVariants())}>
                  Opening Balance (Rp)
                </Label>
                <Input
                  type="number"
                  id="openingBalance"
                  name="openingBalance"
                  defaultValue={fields.openingBalance.initialValue}
                  className="w-[200px]"
                />
                <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                  {fields.openingBalance.errors}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/chart-of-accounts/coa`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={buttonVariants()}
              isDisabled={submitting}
            >
              {submitting ? "Saving" : "Save"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
