import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  json,
  redirect,
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
import { ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Label, labelVariants } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { selectClassName } from "~/components/ui/select";
import { buttonVariants } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";
import { cn } from "~/lib/utils";
import { getChartOfAccounts } from "~/services/chart-of-account.server";
import {
  editJournalEntry,
  getJournalEntryById,
} from "~/services/journal.server";
import {
  parseAbsoluteToLocal,
  parseZonedDateTime,
} from "@internationalized/date";
import { RADatePicker } from "~/components/ui/react-aria/datepicker";
import { AccountComboBox } from "~/components/comboboxes/account-combobox";
import { Separator } from "~/components/ui/separator";
import { currencyFormatter } from "~/utils/currency";

const schema = z.object({
  referenceNumber: z.string().optional(),
  description: z.string(),
  date: z
    .string()
    .transform((dt) => parseZonedDateTime(dt).toDate())
    .pipe(z.date()),
  entryLines: z
    .array(
      z.object({
        accountId: z.string(),
        type: z.enum(["CREDIT", "DEBIT"]),
        amount: z.number(),
      })
    )
    .min(2, "Minimun 2 entry line")
    .refine(
      (lines) => {
        const totalCredit = lines.reduce((acc, curr) => {
          if (curr.type === "CREDIT") {
            return acc + Number(curr.amount);
          }
          return acc;
        }, 0);
        const totalDebit = lines.reduce((acc, curr) => {
          if (curr.type === "DEBIT") {
            return acc + Number(curr.amount);
          }
          return acc;
        }, 0);
        return totalDebit === totalCredit;
      },
      { message: "Total credits and debits must balance!" }
    ),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const journalId = params.id;
  if (!journalId) {
    return redirect(`/app/journals`);
  }
  await requirePermission(request, "manage:finance");

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const {
    description,
    referenceNumber,
    date,
    entryLines: _lines,
  } = submission.value;

  const entryLines = _lines.map((line) => ({
    ...line,
    amount: new Prisma.Decimal(line.amount),
  }));

  await editJournalEntry({
    id: journalId,
    description,
    entryLines,
    date,
    referenceNumber,
  });

  return redirectWithToast(`/app/journals`, {
    description: `Journal entry edited`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const journalId = params.id;
  if (!journalId) {
    return redirect(`/app/journals`);
  }

  await requirePermission(request, "manage:finance");

  const journalEntry = await getJournalEntryById({
    id: journalId,
  });

  if (!journalEntry) {
    return redirect(`/app/journals`);
  }

  const accounts = await getChartOfAccounts();

  return json({ accounts, journalEntry });
}

export default function AddNewJournal() {
  const lastResult = useActionData<typeof action>();
  const { accounts, journalEntry } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: {
      entryLines: journalEntry.entryLines,
      date: journalEntry.date,
      description: journalEntry.description,
      referenceNumber: journalEntry.referenceNumber,
    },
  });

  const entryLines = fields.entryLines.getFieldList();

  const entryLinesValue = fields.entryLines.value;

  let totalDebit = 0;
  let totalCredit = 0;

  if (Array.isArray(entryLinesValue)) {
    totalDebit = entryLinesValue.reduce((acc, curr) => {
      if (curr?.type && curr?.amount && curr.type === "DEBIT") {
        return acc + Number(curr.amount);
      }
      return acc;
    }, 0);
    totalCredit = entryLinesValue.reduce((acc, curr) => {
      if (curr?.type && curr?.amount && curr.type === "CREDIT") {
        return acc + Number(curr.amount);
      }
      return acc;
    }, 0);
  }

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/journals`)}
      className="overflow-hidden w-full max-w-4xl"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold mb-4">
            Edit Entry
          </Heading>
          <div className="grid gap-4 py-4">
            <div className="flex gap-x-4">
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
              <div>
                <RADatePicker
                  label="Date"
                  name="date"
                  granularity="second"
                  hourCycle={24}
                  defaultValue={
                    fields.date.initialValue
                      ? parseAbsoluteToLocal(fields.date.initialValue)
                      : undefined
                  }
                />
                <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                  {fields.date.errors}
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="note">Description</Label>
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
            <fieldset className="border p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <legend className={labelVariants()}>Entry Lines</legend>
                <Button
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                  onPress={() => form.insert({ name: fields.entryLines.name })}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Entry Line
                </Button>
              </div>
              <Separator className="my-3" />
              <div className="space-y-4">
                {entryLines.map((entryLine, index) => {
                  const entryLineFields = entryLine.getFieldset();

                  return (
                    <div key={entryLine.key} className="flex gap-2 items-end">
                      <div className="flex gap-2 items-end flex-1">
                        <div className="grid gap-2">
                          <Select
                            name={entryLineFields.type.name}
                            defaultSelectedKey={
                              entryLineFields.type.initialValue
                            }
                            aria-label="type"
                            className="w-32"
                          >
                            <Label className={cn(labelVariants())}>
                              Select Type
                            </Label>
                            <Button
                              className={cn(
                                selectClassName,
                                "mt-1 h-9 focus:ring-1 focus:ring-offset-0"
                              )}
                            >
                              <SelectValue />
                              <span aria-hidden="true">
                                <ChevronDownIcon className="w-4 h-4" />
                              </span>
                            </Button>
                            <Popover className="-mt-1">
                              <ListBox className="border p-2 rounded-md bg-background space-y-1 w-32">
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
                          {entryLineFields.type.errors && (
                            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                              {entryLineFields.type.errors}
                            </p>
                          )}
                        </div>
                        <AccountComboBox
                          name={entryLineFields.accountId.name}
                          errorMessage={
                            entryLineFields.accountId.errors
                              ? entryLineFields.accountId.errors?.toString()
                              : undefined
                          }
                          accounts={accounts}
                          defaultValue={entryLineFields.accountId.initialValue}
                        />
                        <div className="grid gap-2">
                          <Label
                            htmlFor={`amount-${index}`}
                            className={cn(labelVariants(), "leading-none")}
                          >
                            Amount (Rp)
                          </Label>
                          <Input
                            type="number"
                            id={`amount-${index}`}
                            name={entryLineFields.amount.name}
                            defaultValue={entryLineFields.amount.initialValue}
                            className="h-9"
                          />
                          {entryLineFields.amount.errors && (
                            <p className="-mt-1.5 text-sm text-red-600 font-semibold focus:outline-none">
                              {entryLineFields.amount.errors}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        className={cn(
                          buttonVariants({ variant: "outline", size: "icon" }),
                          "text-red-600"
                        )}
                        onPress={() =>
                          form.remove({ index, name: fields.entryLines.name })
                        }
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <p className="text-sm px-3 py-3 border rounded font-semibold text-center">
                  TOTAL DEBIT : {currencyFormatter("IDR", totalDebit)}
                </p>
                <p className="text-sm px-3 py-3 border rounded font-semibold text-center">
                  TOTAL CREDIT : {currencyFormatter("IDR", totalCredit)}
                </p>
              </div>
              {fields.entryLines.errors &&
              fields.entryLines.errors.length !== 0 ? (
                <p
                  role="alert"
                  className="block px-2 py-1 border border-red-800 text-red-600 rounded-md text-sm font-semibold mt-2"
                >
                  {fields.entryLines.errors}
                </p>
              ) : null}
            </fieldset>
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
              {submitting ? "Saving" : "Save"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
