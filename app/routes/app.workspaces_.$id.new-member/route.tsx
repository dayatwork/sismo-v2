import {
  Form,
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
import { Modal, Dialog, Button, Heading } from "react-aria-components";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import { redirectWithToast } from "~/utils/toast.server";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  addWorkspaceMembers,
  requireWorkspacePermission,
} from "~/services/workspace.server";
import { type loader as workspaceIdLoader } from "../app.workspaces_.$id/route";
import { UserComboBox } from "./user-combobox";
import { RoleComboBox } from "./role-combobox";
import { PlusIcon, Trash2Icon } from "lucide-react";

const schema = z.object({
  members: z
    .array(z.object({ userId: z.string(), roleId: z.string() }))
    .nonempty("Must containt at least 1 member"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect("/app/workspaces");
  }

  const { allowed } = await requireWorkspacePermission(
    request,
    workspaceId,
    "manage:board"
  );
  if (!allowed) {
    return redirectWithToast(`/app/workspaces/${workspaceId}`, {
      description: `Unauthorized`,
      type: "error",
    });
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), error: null });
  }

  const { members } = submission.value;

  try {
    await addWorkspaceMembers({
      members,
      workspaceId,
    });
    return redirectWithToast(`/app/workspaces/${workspaceId}`, {
      description: `New members added`,
      type: "success",
    });
  } catch (error: any) {
    return json({ submission, error: error.message });
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect("/app/workspaces");
  }

  const { allowed } = await requireWorkspacePermission(
    request,
    workspaceId,
    "manage:board"
  );
  if (!allowed) {
    return redirect(`/app/workspace/${workspaceId}`);
  }

  return null;
}

export default function AddBoard() {
  const actionData = useActionData<typeof action>();
  const loaderData = useRouteLoaderData<typeof workspaceIdLoader>(
    "routes/app.workspaces_.$id"
  );
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });
  const members = fields.members.getFieldList();

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/workspaces/${id}`)}
      className="overflow-hidden w-full max-w-lg"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Add New Member
          </Heading>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="space-y-4 mt-6">
            {members.map((member, index) => {
              const memberFields = member.getFieldset();
              return (
                <div key={member.key} className="flex gap-2 items-end">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <UserComboBox
                      name={memberFields.userId.name}
                      errorMessage={
                        memberFields.userId.errors
                          ? memberFields.userId.errors.toString()
                          : undefined
                      }
                      users={loaderData?.users || []}
                    />
                    <RoleComboBox
                      name={memberFields.roleId.name}
                      errorMessage={
                        memberFields.roleId.errors
                          ? memberFields.roleId.errors.toString()
                          : undefined
                      }
                      roles={loaderData?.workspaceRoles || []}
                    />
                  </div>
                  <Button
                    className={cn(
                      buttonVariants({ variant: "outline", size: "icon" }),
                      "text-red-600"
                    )}
                    onPress={() =>
                      form.remove({ index, name: fields.members.name })
                    }
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          {fields.members.errors && fields.members.errors.length !== 0 ? (
            <p
              role="alert"
              className="block px-2 py-1 border border-red-800 text-red-600 rounded-md text-sm font-semibold"
            >
              {fields.members.errors}
            </p>
          ) : null}
          <Button
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-4"
            )}
            onPress={() => form.insert({ name: fields.members.name })}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Member
          </Button>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/workspaces/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(buttonVariants())}
              isDisabled={submitting}
              onPress={() => console.log("press")}
            >
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
