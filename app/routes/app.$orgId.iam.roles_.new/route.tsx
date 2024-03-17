import {
  Form,
  Link,
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
import { parse } from "@conform-to/zod";
import { z } from "zod";

import { Button } from "~/components/ui/button";
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
import { groupedPermissions } from "~/utils/permission";
import { createRole } from "~/services/role.server";
import { ArrowLeft } from "lucide-react";

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

  await createRole({ name, organizationId, permissions, description });

  return redirectWithToast(`/app/${organizationId}/iam/roles`, {
    description: `New role created`,
    type: "success",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  // const user = await requiredPermission(request, "manage:role");
  // if (!user) {
  //   return redirectWithToast(`/app/dashboard`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  return json({ groupedPermissions: groupedPermissions });
}

export default function AddNewRole() {
  const lastSubmission = useActionData<typeof action>();
  const { groupedPermissions } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
  });

  return (
    <div className="mt-6">
      <Link
        to={`/app/${orgId}/iam/roles`}
        className="font-semibold hover:underline inline-flex items-center gap-1 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 mt-px transition" />{" "}
        Back to role list
      </Link>
      <div className="mt-4 border rounded-lg">
        <h1 className="text-xl font-bold tracking-tight px-6 py-4">
          Create New Role
        </h1>
        <Separator />
        <Form className="p-6" method="post" {...form.props}>
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
                <p role="alert" className="text-sm font-semibold text-red-600">
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
                <p role="alert" className="text-sm font-semibold text-red-600">
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
              variant="ghost"
              onClick={() => navigate("/app/organizations")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
