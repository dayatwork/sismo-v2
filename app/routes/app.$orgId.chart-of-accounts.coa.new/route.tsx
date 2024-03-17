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
  Label,
} from "react-aria-components";

import { Input } from "~/components/ui/input";
import { redirectWithToast } from "~/utils/toast.server";
import { Textarea } from "~/components/ui/textarea";
import { requirePermission } from "~/utils/auth.server";
import {
  createChartOfAccount,
  getCoaClasses,
  getCoaTypes,
} from "~/services/chart-of-account.server";
import { cn } from "~/lib/utils";
import { selectClassName } from "~/components/ui/select";
import { ChevronDownIcon } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import { useState } from "react";
import { labelVariants } from "~/components/ui/label";

const schema = z.object({
  typeId: z.string(),
  code: z.string(),
  accountName: z.string(),
  normalBalance: z.enum(["CREDIT", "DEBIT"]),
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

  const { accountName, code, normalBalance, typeId, description } =
    submission.value;

  await createChartOfAccount({
    accountName,
    code,
    normalBalance,
    typeId,
    description,
    organizationId,
  });

  return redirectWithToast(`/app/${organizationId}/chart-of-accounts/coa`, {
    description: `New chart of account created`,
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
    return redirect(`/app/${organizationId}`);
  }

  const [coaClasses, coaTypes] = await Promise.all([
    getCoaClasses({ organizationId }),
    getCoaTypes({ organizationId }),
  ]);

  return json({ coaClasses, coaTypes });
}

export default function CreateChartOfAccount() {
  const lastSubmission = useActionData<typeof action>();
  const { coaClasses, coaTypes } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [classId, setClassId] = useState("");

  const filteredTypesOptions = classId
    ? coaTypes.filter((type) => type.classId === classId)
    : coaTypes;

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/chart-of-accounts/coa`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6">
        <Form method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold mb-4">
            Create New Chart of Account
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
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.classId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Select name="typeId" isDisabled={!classId}>
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
              <Label className={cn(labelVariants())} htmlFor="code">
                Code
              </Label>
              <Input
                id="code"
                name="code"
                defaultValue={fields.code.defaultValue}
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
                defaultValue={fields.accountName.defaultValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.accountName.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Select name="normalBalance">
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
            </div>

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
                defaultValue={fields.description.defaultValue}
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
              onPress={() => navigate(`/app/${orgId}/chart-of-accounts/coa`)}
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
