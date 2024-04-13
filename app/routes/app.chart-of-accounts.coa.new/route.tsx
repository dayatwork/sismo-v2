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
import { Modal, Dialog, Button, Heading, Label } from "react-aria-components";

import { Input } from "~/components/ui/input";
import { redirectWithToast } from "~/utils/toast.server";
import { Textarea } from "~/components/ui/textarea";
import { requirePermission } from "~/utils/auth.server";
import { buttonVariants } from "~/components/ui/button";
import { labelVariants } from "~/components/ui/label";
import { AccountCategoryComboBox } from "~/components/comboboxes/account-category-combobox";
import { AccountTypeComboBox } from "~/components/comboboxes/account-type-combobox";
import { cn } from "~/lib/utils";
import {
  createChartOfAccount,
  getCoaCategories,
  getCoaTypes,
} from "~/services/chart-of-account.server";

const schema = z.object({
  typeId: z.string(),
  code: z.string(),
  accountName: z.string(),
  // normalBalance: z.enum(["CREDIT", "DEBIT"]),
  description: z.string().optional(),
  openingBalance: z.number().min(0),
});

export async function action({ request }: ActionFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { accountName, code, typeId, description, openingBalance } =
    submission.value;

  await createChartOfAccount({
    accountName,
    code,
    typeId,
    description,
    openingBalance,
  });

  return redirectWithToast(`/app/chart-of-accounts/coa`, {
    description: `New chart of account created`,
    type: "success",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const [coaClasses, coaTypes] = await Promise.all([
    getCoaCategories(),
    getCoaTypes(),
  ]);

  return json({ coaClasses, coaTypes });
}

export default function CreateChartOfAccount() {
  const lastResult = useActionData<typeof action>();
  const { coaClasses, coaTypes } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [categoryId, setCategoryId] = useState("");

  const filteredTypesOptions = categoryId
    ? coaTypes
        .filter((type) => type.categoryId === categoryId)
        .map((type) => ({ ...type, category: type.category.name }))
    : coaTypes.map((type) => ({ ...type, category: type.category.name }));

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
      onOpenChange={() => navigate(`/app/chart-of-accounts/coa`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold mb-4">
            Create New Chart of Account
          </Heading>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              {/* <Select
                name="categoryId"
                selectedKey={categoryId}
                onSelectionChange={(v) => setCategoryId(v.toString())}
              >
                <Label className={cn(labelVariants())}>Select Class</Label>
                <Button className={cn(selectClassName, "mt-1 flex")}>
                  <SelectValue></SelectValue>
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
                        <span>{coaClass.name}</span>
                        <span className="text-muted-foreground">
                          {coaClass.normalBalance}
                        </span>
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select> */}
              <AccountCategoryComboBox
                name="categoryId"
                categories={coaClasses}
                selectedKey={categoryId}
                onSelectionChange={(v) => setCategoryId(v?.toString())}
              />
            </div>
            <div className="grid gap-2">
              {/* <Select name="typeId" isDisabled={!categoryId}>
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
              </Select> */}
              <AccountTypeComboBox name="typeId" types={filteredTypesOptions} />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.typeId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Label className={cn(labelVariants())} htmlFor="code">
                Code
              </Label>
              <Input
                id="code"
                name="code"
                defaultValue={fields.code.initialValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.code.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Label className={cn(labelVariants())} htmlFor="accountName">
                Account Name
              </Label>
              <Input
                id="accountName"
                name="accountName"
                defaultValue={fields.accountName.initialValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.accountName.errors}
              </p>
            </div>
            {/* <div className="grid gap-2">
              <Select name="normalBalance" >
                <Label className={cn(labelVariants())}>
                  Select Normal Balance
                </Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-md">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    <ListBoxItem
                      key="DEBIT"
                      id="DEBIT"
                      value={{ id: "DEBIT" }}
                      className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                    >
                      Debit
                    </ListBoxItem>
                    <ListBoxItem
                      key="CREDIT"
                      id="CREDIT"
                      value={{ id: "CREDIT" }}
                      className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                    >
                      Credit
                    </ListBoxItem>
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.normalBalance.errors}
              </p>
            </div> */}

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label className={cn(labelVariants())} htmlFor="description">
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
            </div>

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
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
