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
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";

import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { labelVariants } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import {
  editWorkspaceRole,
  requireWorkspacePermission,
} from "~/services/workspace.server";
import { groupedWorkspacePermissions } from "~/utils/workspace.permission";

const schema = z.object({
  name: z.string(),
  description: z.string().default("").optional(),
  permissions: z.array(z.string()),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect(`/app/workspaces`);
  }

  const roleId = params.roleId;
  if (!roleId) {
    return redirect(`/app/workspaces/${workspaceId}`);
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
    return json(submission.reply());
  }

  const { name, description, permissions } = submission.value;

  try {
    await editWorkspaceRole({
      id: roleId,
      name,
      permissions,
      description: description || "",
    });

    return redirectWithToast(`/app/workspaces/${workspaceId}`, {
      description: `Role edited`,
      type: "success",
    });
  } catch (error: any) {
    return json({ submission, error: error.message });
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect(`/app/workspaces`);
  }

  const roleId = params.roleId;
  if (!roleId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  const { allowed, workspace } = await requireWorkspacePermission(
    request,
    workspaceId,
    "manage:permission"
  );
  if (!allowed) {
    return redirect(`/app/workspace/${workspaceId}`);
  }
  if (!workspace) {
    return redirect(`/app/workspaces`);
  }

  return json({
    role: workspace.workspaceRoles.find((role) => role.id === roleId),
  });
}

export default function RoleDetails() {
  const lastResult = useActionData<typeof action>();
  const { role } = useLoaderData<typeof loader>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    defaultValue: {
      name: role?.name,
      description: role?.description,
    },
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
                            defaultChecked={role?.permissions.includes(
                              permission.name
                            )}
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
    // <div className="mt-6">
    //   <Outlet />
    //   <Link
    //     to={`/app/workspaces/${id}`}
    //     className="font-semibold hover:underline inline-flex items-center gap-1 group"
    //   >
    //     <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 mt-px transition" />{" "}
    //     Back to role list
    //   </Link>
    //   <div className="mt-4 grid grid-cols-3 gap-6 items-start">
    //     <div className="col-span-3 xl:col-span-2">
    //       <div className="border rounded-lg bg-neutral-50 dark:bg-neutral-900">
    //         <h2 className="font-semibold text-lg px-6 py-4">Edit Role</h2>
    //         <Separator />
    //         <Form
    //           className="px-6 py-4"
    //           method="post"
    //           id={form.id}
    //           onSubmit={form.onSubmit}
    //         >
    //           <div className="space-y-6">
    //             <div className="grid gap-2 max-w-xs">
    //               <Label htmlFor="name">Name</Label>
    //               <Input
    //                 id="name"
    //                 autoFocus
    //                 name="name"
    //                 defaultValue={fields.name.initialValue}
    //               />
    //               {fields.name.errors ? (
    //                 <p
    //                   role="alert"
    //                   className="text-sm font-semibold text-red-600"
    //                 >
    //                   {fields.name.errors}
    //                 </p>
    //               ) : null}
    //             </div>
    //             <div className="grid gap-2 max-w-sm">
    //               <div className="flex justify-between">
    //                 <Label htmlFor="description">Description</Label>
    //                 <span className="leading-none text-sm text-muted-foreground">
    //                   Optional
    //                 </span>
    //               </div>
    //               <Textarea
    //                 id="description"
    //                 name="description"
    //                 defaultValue={fields.description.initialValue}
    //               />
    //               {fields.description.errors ? (
    //                 <p
    //                   role="alert"
    //                   className="text-sm font-semibold text-red-600"
    //                 >
    //                   {fields.description.errors}
    //                 </p>
    //               ) : null}
    //             </div>
    //             <fieldset>
    //               <legend className={cn(labelVariants())}>Permissions</legend>
    //               <div className="mt-2 border rounded-lg p-4 pb-8">
    //                 {groupedWorkspacePermissions.map((group, index) => (
    //                   <div key={group.groupName}>
    //                     {index !== 0 && <Separator className="mt-6 mb-4" />}
    //                     <h3 className="mb-4 capitalize font-semibold text-primary">
    //                       {group.groupName}
    //                     </h3>
    //                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    //                       {group.permissions.map((permission) => (
    //                         <div
    //                           key={permission.name}
    //                           className="flex items-center gap-2"
    //                         >
    //                           <Checkbox
    //                             name="permissions"
    //                             value={permission.name}
    //                             className="w-6 h-6"
    //                             id={permission.name}
    //                             defaultChecked={role?.permissions.includes(
    //                               permission.name
    //                             )}
    //                           />

    //                           <HoverCard>
    //                             <HoverCardTrigger>
    //                               <Label
    //                                 htmlFor={permission.name}
    //                                 className="text-base cursor-pointer hover:text-primary truncate"
    //                               >
    //                                 {permission.name.replace(":", "-")}
    //                               </Label>
    //                             </HoverCardTrigger>
    //                             <HoverCardContent className="w-80">
    //                               <dl className="space-y-4">
    //                                 <div>
    //                                   <dt className="text-sm text-muted-foreground font-semibold mb-1">
    //                                     Name
    //                                   </dt>
    //                                   <dd>{permission.name}</dd>
    //                                 </div>
    //                                 <Separator />
    //                                 <div>
    //                                   <dt className="text-sm text-muted-foreground font-semibold mb-1">
    //                                     Description
    //                                   </dt>
    //                                   <dd>{permission.description}</dd>
    //                                 </div>
    //                               </dl>
    //                             </HoverCardContent>
    //                           </HoverCard>
    //                         </div>
    //                       ))}
    //                     </div>
    //                   </div>
    //                 ))}
    //               </div>
    //             </fieldset>
    //           </div>
    //           <div className="mt-8 flex justify-end gap-2 w-full">
    //             <Button
    //               type="button"
    //               variant="ghost"
    //               onClick={() => navigate(`/app/workspaces/${id}`)}
    //             >
    //               Cancel
    //             </Button>
    //             <Button type="submit">Save</Button>
    //           </div>
    //         </Form>
    //       </div>
    //       <div className="mt-6 border rounded-lg bg-neutral-50 dark:bg-neutral-900">
    //         <h2 className="font-semibold text-lg px-6 py-4">Danger Zone</h2>
    //         <Separator />
    //         <div className="px-6 py-4">
    //           <Link
    //             to="delete"
    //             className={buttonVariants({ variant: "destructive" })}
    //           >
    //             Delete Role
    //           </Link>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}
