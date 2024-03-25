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
  Button,
  Heading,
  Select,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
} from "react-aria-components";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";
import {
  editCoaType,
  getCoaClasses,
  getCoaTypeById,
} from "~/services/chart-of-account.server";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { selectClassName } from "~/components/ui/select";
import { ChevronDownIcon } from "lucide-react";

const schema = z.object({
  name: z.string(),
  classId: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const typeId = params.id;
  if (!typeId) {
    return redirect(`/app/chart-of-accounts/type`);
  }

  await requirePermission(request, "manage:finance");

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { name, classId } = submission.value;

  await editCoaType({
    name,
    classId,
    typeId,
  });

  return redirectWithToast(`/app/chart-of-accounts/type`, {
    description: `COA type edited`,
    type: "success",
  });
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const typeId = params.id;
  if (!typeId) {
    return redirect(`/app/chart-of-accounts/type`);
  }

  await requirePermission(request, "manage:finance");

  const [coaType, coaClasses] = await Promise.all([
    getCoaTypeById({
      typeId,
    }),
    getCoaClasses(),
  ]);

  if (!coaType) {
    return redirect(`/app/chart-of-accounts/type`);
  }

  return json({ coaType, coaClasses });
}

export default function EditChartOfAccountType() {
  const lastResult = useActionData<typeof action>();
  const { coaType, coaClasses } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    defaultValue: {
      name: coaType.name,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/chart-of-accounts/type`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold mb-4">
            Edit COA Type
          </Heading>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select name="classId" defaultSelectedKey={coaType.classId}>
                <Label>Select Class</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 outline-none">
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoFocus
                name="name"
                defaultValue={fields.name.initialValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.name.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/chart-of-accounts/type`)}
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
