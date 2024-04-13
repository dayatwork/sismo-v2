import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
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
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";
import { Checkbox } from "~/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { cn } from "~/lib/utils";
import { redirectWithToast } from "~/utils/toast.server";
import { groupedWorkspacePermissions } from "~/utils/workspace.permission";
import {
  createWorkspaceRole,
  requireWorkspacePermission,
} from "~/services/workspace.server";

const schema = z.object({
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect("/app/workspaces");
  }

  const { allowed } = await requireWorkspacePermission(
    request,
    workspaceId,
    "manage:permission"
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

  const { name, description, permissions } = submission.value;

  try {
    await createWorkspaceRole({
      name,
      description,
      workspaceId,
      permissions,
    });
    return redirectWithToast(`/app/workspaces/${workspaceId}`, {
      description: `New role created`,
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
    "manage:permission"
  );
  if (!allowed) {
    return redirect(`/app/workspace/${workspaceId}`);
  }

  return null;
}

export default function AddRole() {
  const actionData = useActionData<typeof action>();
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
      className="overflow-hidden w-full max-w-lg"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Create New Role
          </Heading>
          <div className="mt-4 grid gap-6 py-4">
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
              <div className="flex justify-between">
                <Label htmlFor="description" className={labelVariants()}>
                  Description
                </Label>
                <span className="leading-none text-sm text-muted-foreground">
                  Optional
                </span>
              </div>
              <Textarea
                id="description"
                name="description"
                defaultValue={fields.description.initialValue}
              />
              {fields.description.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.description.errors}
                </p>
              ) : null}
            </div>
            <fieldset>
              <legend className={cn(labelVariants())}>Permissions</legend>
              <div className="mt-2 border rounded-lg p-4 pb-8">
                {groupedWorkspacePermissions.map((group, index) => (
                  <div key={group.groupName}>
                    {index !== 0 && <Separator className="mt-6 mb-4" />}
                    <h3
                      className={cn(
                        labelVariants(),
                        "mb-4 capitalize font-semibold text-primary"
                      )}
                    >
                      {group.groupName}
                    </h3>
                    <div className="grid grid-cols-5 gap-6">
                      {group.permissions.map((permission) => (
                        <div
                          key={permission.name}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            name="permissions"
                            value={permission.name}
                            className="w-6 h-6"
                            id={permission.name}
                          />
                          <HoverCard>
                            <HoverCardTrigger>
                              <Label
                                htmlFor={permission.name}
                                className="text-base cursor-pointer hover:text-primary truncate"
                              >
                                {permission.name}
                              </Label>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <dl className="space-y-4">
                                <div>
                                  <dt className="text-sm text-muted-foreground font-semibold mb-1">
                                    Name
                                  </dt>
                                  <dd>{permission.name}</dd>
                                </div>
                                <Separator />
                                <div>
                                  <dt className="text-sm text-muted-foreground font-semibold mb-1">
                                    Description
                                  </dt>
                                  <dd>{permission.description}</dd>
                                </div>
                              </dl>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              // variant="ghost"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate("/app/organizations")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isDisabled={submitting}
              className={buttonVariants()}
            >
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
