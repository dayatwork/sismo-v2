import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";
import { setRegularWage } from "~/services/wage.server";
import { type loader as wagesLoader } from "../app.wages/route";

const schema = z.object({
  amount: z.number().min(0),
  type: z.enum(["HOURLY", "SALARY"]),
  normalWorkingHours: z.number().min(0),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = params.userId;
  if (!userId) {
    return redirect("/app/wages/regular");
  }

  await requirePermission(request, "manage:payroll");
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), error: null });
  }

  const { amount, type, normalWorkingHours } = submission.value;

  try {
    await setRegularWage({
      amount,
      type,
      userId,
      normalWorkingHours,
    });
    return redirectWithToast(`/app/wages/regular`, {
      description: `Regular wages set`,
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

export default function SetRegularWage() {
  const actionData = useActionData<typeof action>();
  const wagesloaderData =
    useRouteLoaderData<typeof wagesLoader>("routes/app.wages");
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [type, setType] = useState<"HOURLY" | "MONTHLY">("HOURLY");

  const selectedUser = wagesloaderData?.usersWithWages.find(
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
    return <Navigate to="/app/wages/regular" />;
  }

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/wages/regular`)}
      className="overflow-hidden w-full max-w-sm"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Heading slot="title" className="text-lg font-semibold">
          Set Regular Wage
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
              <Label htmlFor="type" className={labelVariants()}>
                Type of wages
              </Label>
              <RadioGroup
                defaultValue={type}
                name="type"
                className="grid grid-cols-2 gap-4"
                onValueChange={(v) => setType(v as "HOURLY" | "MONTHLY")}
              >
                <div>
                  <RadioGroupItem
                    value="HOURLY"
                    id="HOURLY"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="HOURLY"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary font-semibold"
                  >
                    Hourly Wage
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="SALARY"
                    id="SALARY"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="SALARY"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary font-semibold"
                  >
                    Salary Wage
                  </Label>
                </div>
              </RadioGroup>
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
                {type === "HOURLY" ? (
                  <span className="font-semibold whitespace-nowrap text-sm text-muted-foreground">
                    / hour
                  </span>
                ) : (
                  <span className="font-semibold whitespace-nowrap text-sm text-muted-foreground">
                    / month
                  </span>
                )}
              </div>
              {fields.amount.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.amount.errors}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="normalWorkingHours" className={labelVariants()}>
                Normal Working Hours
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="normalWorkingHours"
                  name="normalWorkingHours"
                  type="number"
                  defaultValue={fields.normalWorkingHours.initialValue}
                />
                <span className="font-semibold whitespace-nowrap text-sm text-muted-foreground">
                  hours / day
                </span>
              </div>
              {fields.normalWorkingHours.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.normalWorkingHours.errors}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/wages/regular`)}
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
