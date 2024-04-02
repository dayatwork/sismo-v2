import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  Modal,
  Dialog,
  Select,
  Label,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Heading,
} from "react-aria-components";
import { ChevronDownIcon } from "lucide-react";

import { redirectWithToast } from "~/utils/toast.server";
import { labelVariants } from "~/components/ui/label";
import { selectClassName } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { addDepartmentMembers } from "~/services/department.server";
import { requirePermission } from "~/utils/auth.server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getUsers } from "~/services/user.server";
import { UserComboBox } from "~/components/comboboxes/user-combobox";

const schema = z.object({
  userId: z.string(),
  role: z.enum(["HEAD", "STAFF"]),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const departmentId = params.id;
  if (!departmentId) return redirect(`/app/departments`);

  await requirePermission(request, "manage:department");

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { role, userId } = submission.value;

  try {
    await addDepartmentMembers({
      departmentId,
      members: [{ role, userId }],
    });

    return redirectWithToast(`/app/departments/${departmentId}`, {
      description: `New member added`,
      type: "success",
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // return redirectWithToast(
      //   `/app/${organizationId}/departments/${departmentId}`,
      //   {
      //     description: `Duplicate member!`,
      //     type: "error",
      //   }
      // );
      return json(
        submission.reply({
          formErrors: ["Duplicate member. The user is already a member."],
        })
      );
    }
    return redirectWithToast(`/app/departments/${departmentId}`, {
      description: `Something went wrong`,
      type: "error",
    });
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const departmentId = params.id;
  if (!departmentId) return redirect(`/app/departments`);

  await requirePermission(request, "manage:department");

  const users = await getUsers();

  return json({ users });
}

export default function AddDepartmentMember() {
  const lastResult = useActionData<typeof action>();
  const { users } = useLoaderData<typeof loader>();
  const { membersIds } = useOutletContext<{ membersIds: string[] }>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

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
      onOpenChange={() => navigate(`/app/departments/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Add member
          </Heading>
          <div className="mt-2 grid gap-4 py-4">
            {Boolean(form.errors?.length) && (
              <p
                role="alert"
                className="text-red-700 border border-red-900 rounded py-1 px-2 text-sm font-medium"
              >
                Duplicate member! The user is already a member.
              </p>
            )}
            <div className="grid gap-2">
              <UserComboBox
                name="userId"
                errorMessage={fields.userId.errors?.toString()}
                users={users.filter((user) => !membersIds.includes(user.id))}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.userId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Select
                name="role"
                className="grid gap-2"
                placeholder="Select a role"
              >
                <Label className={labelVariants()}>Role</Label>
                <Button className={selectClassName}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm shadow-lg dark:shadow-white/10">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1">
                    <ListBoxItem
                      id="HEAD"
                      value={{ id: "HEAD" }}
                      className="px-1 py-1.5 text-sm font-semibold cursor-pointer hover:bg-accent rounded"
                    >
                      Head
                    </ListBoxItem>
                    <ListBoxItem
                      id="STAFF"
                      value={{ id: "STAFF" }}
                      className="px-1 py-1.5 text-sm font-semibold cursor-pointer hover:bg-accent rounded"
                    >
                      Staff
                    </ListBoxItem>
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.role.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/departments/${id}`)}
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
