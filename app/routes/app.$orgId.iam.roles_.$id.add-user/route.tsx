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
import { parse } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import { redirectWithToast } from "~/utils/toast.server";
import { ChevronDownIcon } from "lucide-react";
import { labelVariants } from "~/components/ui/label";
import { selectClassName } from "~/components/ui/select";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  assignRoleToUser,
  getRoleById,
  getUsersForAssignRole,
} from "~/services/role.server";
// import { Label } from "~/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "~/components/ui/select";

const schema = z.object({
  userId: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const roleId = params.id;
  if (!roleId) {
    return redirect(`/app/${organizationId}/iam/roles`);
  }

  // const user = await requiredPermission(request, "manage:role");
  // if (!user) {
  //   return redirectWithToast(`/app/dashboard`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const { userId } = submission.value;

  await assignRoleToUser({ organizationId, roleId, userId });

  return redirectWithToast(`/app/${organizationId}/iam/roles/${roleId}`, {
    description: `User added`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const roleId = params.id;
  if (!roleId) {
    return redirect(`/app/${organizationId}/iam/roles`);
  }

  // const user = await requiredPermission(request, "manage:role");
  // if (!user) {
  //   return redirectWithToast(`/app/dashboard`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  const role = await getRoleById({ id: roleId, organizationId });

  if (!role) {
    return redirect(`/app/${organizationId}/iam/roles`);
  }

  const users = await getUsersForAssignRole({ organizationId, roleId });

  return json({ role, users });
}

export default function AddUserRole() {
  const lastSubmission = useActionData<typeof action>();
  const { users, role } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId, id } = useParams<{ orgId: string; id: string }>();
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
      onOpenChange={() => navigate(`/app/${orgId}/iam/roles/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold">
            Add new user to role "{role.name}"
          </Heading>
          <div className="mt-2 grid gap-4 py-4">
            <div className="grid gap-2">
              <Select name="userId" className="grid gap-2">
                <Label className={labelVariants()}>User</Label>
                <Button type="button" className={selectClassName}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1">
                    {users.map((user) => (
                      <ListBoxItem
                        key={user.id}
                        id={user.id}
                        value={{ id: user.id }}
                        className="px-1 py-1.5 text-sm font-semibold hover:bg-accent rounded-md cursor-pointer"
                      >
                        {user.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              {/* <Label htmlFor="name">User</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
              {fields.userId.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.userId.errors}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/${orgId}/iam/roles/${id}`)}
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
