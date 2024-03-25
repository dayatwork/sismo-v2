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
import { requirePermission } from "~/utils/auth.server";
import { UserComboBox } from "./user-combobox";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { addTeamMembers } from "~/services/team.server";
import { getUsers } from "~/services/user.server";

const schema = z.object({
  userId: z.string(),
  role: z.enum(["LEADER", "MEMBER"]),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const teamId = params.id;
  if (!teamId) return redirect(`/app/teams`);

  requirePermission(request, "manage:team");

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { role, userId } = submission.value;

  try {
    await addTeamMembers({
      teamId,
      members: [{ role, userId }],
    });

    return redirectWithToast(`/app/teams/${teamId}`, {
      description: `New member added`,
      type: "success",
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // return redirectWithToast(
      //   `/app/${organizationId}/teams/${teamId}`,
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
    return redirectWithToast(`/app/teams/${teamId}`, {
      description: `Something went wrong`,
      type: "error",
    });
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const teamId = params.id;
  if (!teamId) return redirect(`/app/teams`);

  await requirePermission(request, "manage:team");

  const users = await getUsers();

  return json({ users });
}

export default function AddTeamMember() {
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
      onOpenChange={() => navigate(`/app/teams/${id}`)}
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
                      id="LEADER"
                      value={{ id: "LEADER" }}
                      className="px-1 py-1.5 text-sm font-semibold cursor-pointer hover:bg-accent rounded"
                    >
                      Leader
                    </ListBoxItem>
                    <ListBoxItem
                      id="MEMBER"
                      value={{ id: "MEMBER" }}
                      className="px-1 py-1.5 text-sm font-semibold cursor-pointer hover:bg-accent rounded"
                    >
                      Member
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
              onPress={() => navigate(`/app/teams/${id}`)}
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
