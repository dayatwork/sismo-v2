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
import {
  Modal,
  Dialog,
  Select,
  Label,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Button,
  Heading,
} from "react-aria-components";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";
import { ChevronDownIcon } from "lucide-react";

import { redirectWithToast } from "~/utils/toast.server";
import { labelVariants } from "~/components/ui/label";
import { selectClassName } from "~/components/ui/select";
import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import {
  editOrganizationUser,
  getOrganizationUser,
  memberStatuses,
} from "~/services/user.server";
import { requirePermission } from "~/utils/auth.server";

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  memberId: z.string(),
  memberStatus: z.enum(["FULLTIME", "PARTTIME", "INTERN", "OUTSOURCED"]),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const userId = params.id;
  if (!userId) {
    return redirect(`/app/${organizationId}/iam/users`);
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:iam"
  );
  if (!loggedInUser) {
    return redirectWithToast(`/app/${organizationId}/dashboard`, {
      description: "Forbidden",
      type: "error",
    });
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), error: null });
  }

  const { email, memberId, memberStatus, name } = submission.value;

  try {
    await editOrganizationUser({
      email,
      memberId,
      memberStatus,
      name,
      organizationId,
      userId,
    });
    return redirectWithToast(`/app/${organizationId}/iam/users`, {
      description: `User edited`,
      type: "success",
    });
  } catch (error: any) {
    return json({ submission, error: error.message });
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const userId = params.id;
  if (!userId) {
    return redirect(`/app/${organizationId}/iam/users`);
  }

  const organizationUser = await getOrganizationUser({
    userId,
    organizationId,
  });

  if (!organizationUser) {
    return redirect(`/app/${organizationId}/iam/users`);
  }

  return json({ memberStatuses, organizationUser });
}

export default function AddOrganizationUser() {
  const actionData = useActionData<typeof action>();
  const { memberStatuses, organizationUser } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    shouldValidate: "onSubmit",
    defaultValue: {
      name: organizationUser.user.name,
      email: organizationUser.user.email,
      memberId: organizationUser.memberId,
      memberStatus: organizationUser.memberStatus,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/iam/users`)}
      className="overflow-hidden w-full max-w-sm"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Edit user
          </Heading>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className={labelVariants()}>
                Name
              </Label>
              <Input
                id="name"
                autoFocus
                name="name"
                defaultValue={fields.name.initialValue}
              />
              {fields.name.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.name.errors}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className={labelVariants()}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                defaultValue={fields.email.initialValue}
              />
              {fields.email.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.email.errors}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="memberId" className={labelVariants()}>
                Member ID
              </Label>
              <Input
                id="memberId"
                name="memberId"
                defaultValue={fields.memberId.initialValue}
              />
              {fields.memberId.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.memberId.errors}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Select
                name="memberStatus"
                className="grid gap-2"
                defaultSelectedKey={organizationUser.memberStatus || "FULLTIME"}
              >
                <Label className={labelVariants()}>Member Status</Label>
                <Button type="button" className={selectClassName}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1">
                    {memberStatuses.map((status) => (
                      <ListBoxItem
                        key={status.value}
                        id={status.value}
                        value={{ value: status.value }}
                        className="px-1 py-1.5 text-sm font-semibold hover:bg-accent rounded-md cursor-pointer"
                      >
                        {status.label}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              {fields.memberStatus.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.memberStatus.errors}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/${orgId}/iam/users`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(buttonVariants())}
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
