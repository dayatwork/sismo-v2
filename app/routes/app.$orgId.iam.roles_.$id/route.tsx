import {
  Form,
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { z } from "zod";

import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, labelVariants } from "~/components/ui/label";
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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { editRole, getRoleById } from "~/services/role.server";
import { groupedPermissions } from "~/utils/permission";
import { ArrowLeft, Trash2 } from "lucide-react";

const schema = z.object({
  name: z.string(),
  description: z.string().default("").optional(),
  permissions: z.array(z.string()),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const id = params.id;
  if (!id) {
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

  const { name, description, permissions } = submission.value;

  await editRole({ id, name, permissions, description });

  return redirectWithToast(`/app/${organizationId}/iam/roles/${id}`, {
    description: `Role edited`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const id = params.id;
  if (!id) {
    return redirect(`/app/${organizationId}/iam/roles`);
  }

  // const user = await requiredPermission(request, "manage:role");
  // if (!user) {
  //   return redirectWithToast(`/app/dashboard`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  const role = await getRoleById({ id, organizationId });

  if (!role) {
    return redirect(`/app/${organizationId}/iam/roles`);
  }

  return json({ groupedPermissions, role });
}

export default function RoleDetails() {
  const lastSubmission = useActionData<typeof action>();
  const { groupedPermissions, role } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
    defaultValue: {
      name: role.name,
      description: role.description,
    },
  });

  return (
    <div className="mt-6">
      <Outlet />
      <Link
        to={`/app/${orgId}/iam/roles`}
        className="font-semibold hover:underline inline-flex items-center gap-1 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 mt-px transition" />{" "}
        Back to role list
      </Link>
      <div className="mt-4 grid grid-cols-3 gap-6 items-start">
        <div className="col-span-3 xl:col-span-2">
          <div className="border rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <h2 className="font-semibold text-lg px-6 py-4">Edit Role</h2>
            <Separator />
            <Form className="px-6 py-4" method="post" {...form.props}>
              <div className="space-y-6">
                <div className="grid gap-2 max-w-xs">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    autoFocus
                    name="name"
                    defaultValue={fields.name.defaultValue}
                  />
                  {fields.name.errors ? (
                    <p
                      role="alert"
                      className="text-sm font-semibold text-red-600"
                    >
                      {fields.name.errors}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2 max-w-sm">
                  <div className="flex justify-between">
                    <Label htmlFor="description">Description</Label>
                    <span className="leading-none text-sm text-muted-foreground">
                      Optional
                    </span>
                  </div>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={fields.description.defaultValue}
                  />
                  {fields.description.errors ? (
                    <p
                      role="alert"
                      className="text-sm font-semibold text-red-600"
                    >
                      {fields.description.errors}
                    </p>
                  ) : null}
                </div>
                <fieldset>
                  <legend className={cn(labelVariants())}>Permissions</legend>
                  <div className="mt-2 border rounded-lg p-4 pb-8">
                    {groupedPermissions.map((group, index) => (
                      <div key={group.groupName}>
                        {index !== 0 && <Separator className="mt-6 mb-4" />}
                        <h3 className="mb-4 capitalize font-semibold text-primary">
                          {group.groupName}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                                defaultChecked={role.permissions.includes(
                                  permission.name
                                )}
                              />

                              <HoverCard>
                                <HoverCardTrigger>
                                  <Label
                                    htmlFor={permission.name}
                                    className="text-base cursor-pointer hover:text-primary truncate"
                                  >
                                    {permission.name.replace(":", "-")}
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
                  variant="ghost"
                  onClick={() => navigate(`/app/${orgId}/iam/roles`)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </Form>
          </div>
          <div className="mt-6 border rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <h2 className="font-semibold text-lg px-6 py-4">Danger Zone</h2>
            <Separator />
            <div className="px-6 py-4">
              <Link
                to="delete"
                className={buttonVariants({ variant: "destructive" })}
              >
                Delete Role
              </Link>
            </div>
          </div>
        </div>
        <div className="col-span-3 xl:col-span-1 border rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold tracking-tight px-6 py-4 border-b ">
            Users with role {role.name}
          </h2>
          {role.users.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">No users</p>
          )}
          <ul className="max-h-[400px] overflow-auto">
            {role.users.map((user, index) => (
              <div key={user.id}>
                {index !== 0 && <Separator />}
                <li
                  key={user.id}
                  className="flex justify-between py-3 px-5 group"
                >
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        className="object-cover"
                        src={user.photo || ""}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">{user.name}</span>
                  </div>

                  <Button
                    size="icon"
                    className="text-red-600 opacity-0 group-hover:opacity-100 transition"
                    variant="outline"
                    asChild
                  >
                    <Link
                      to={`/app/${orgId}/iam/roles/${role.id}/remove-user/${user.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Link>
                  </Button>
                </li>
              </div>
            ))}
          </ul>
          <Separator />
          <div className="px-6 py-4">
            <Link
              to="add-user"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Add User
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
