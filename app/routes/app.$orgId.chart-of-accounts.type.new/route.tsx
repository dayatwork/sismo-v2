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
  createCoaType,
  getCoaClasses,
} from "~/services/chart-of-account.server";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { selectClassName } from "~/components/ui/select";
import { ChevronDownIcon } from "lucide-react";

const schema = z.object({
  classId: z.string(),
  name: z.string(),
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

  const { name, classId } = submission.value;

  await createCoaType({
    name,
    organizationId,
    classId,
  });

  return redirectWithToast(`/app/${organizationId}/chart-of-accounts/type`, {
    description: `New type created`,
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

  const coaClasses = await getCoaClasses({ organizationId });

  return json({ coaClasses });
}

export default function CreateCoaType() {
  const lastSubmission = useActionData<typeof action>();
  const { coaClasses } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/chart-of-accounts/type`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6">
        <Form method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold mb-4">
            Create New COA Type
          </Heading>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select name="classId">
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
              <Label htmlFor="name">Type Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={fields.name.defaultValue}
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
              onPress={() => navigate(`/app/${orgId}/chart-of-accounts/type`)}
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
