import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import {
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import { Modal, Dialog, Heading, Button, Label } from "react-aria-components";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import { buttonVariants } from "~/components/ui/button";
import { RoleComboBox } from "~/components/comboboxes/role-combobox";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { labelVariants } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { redirectWithToast } from "~/utils/toast.server";
import {
  requireWorkspacePermission,
  updateWorkspaceMemberRole,
} from "~/services/workspace.server";
import { type loader as workspaceIdLoader } from "../app.workspaces_.$id/route";

const schema = z.object({
  roleId: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect("/app/workspaces");
  }

  const memberId = params.memberId;
  if (!memberId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  const { allowed } = await requireWorkspacePermission(
    request,
    workspaceId,
    "manage:member"
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

  const { roleId } = submission.value;

  try {
    await updateWorkspaceMemberRole({
      workspaceId,
      roleId,
      userId: memberId,
    });
    return redirectWithToast(`/app/workspaces/${workspaceId}`, {
      description: `Member role changed`,
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

  const memberId = params.memberId;
  if (!memberId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  const { allowed, workspace } = await requireWorkspacePermission(
    request,
    workspaceId,
    "manage:board"
  );
  if (!allowed) {
    return redirect(`/app/workspace/${workspaceId}`);
  }
  if (!workspace) {
    return redirect("/app/workspaces");
  }

  return json({
    member: workspace.workspaceMembers.find((wm) => wm.userId === memberId),
  });
}

export default function ChangeWorkspaceMemberRole() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const routeLoaderData = useRouteLoaderData<typeof workspaceIdLoader>(
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

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/workspaces/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Change role
          </Heading>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="mt-4 space-y-4">
            <div className="grid gap-2">
              <Label className={labelVariants()}>User</Label>
              <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-accent">
                <Avatar>
                  <AvatarImage
                    src={loaderData.member?.user.photo || ""}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {loaderData.member?.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">
                  {loaderData.member?.user.name}
                </span>
              </div>
            </div>
            <RoleComboBox
              name="roleId"
              errorMessage={fields.roleId.errors?.toString()}
              roles={routeLoaderData?.workspaceRoles || []}
              defaultValue={loaderData.member?.roleId}
            />
          </div>
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
              {submitting ? "Saving" : "Save"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
