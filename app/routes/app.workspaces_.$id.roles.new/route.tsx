// import {
//   Form,
//   Link,
//   useActionData,
//   useLoaderData,
//   useNavigate,
//   useNavigation,
//   useParams,
// } from "@remix-run/react";
// import {
//   json,
//   type ActionFunctionArgs,
//   type LoaderFunctionArgs,
// } from "@remix-run/node";
// import { useForm } from "@conform-to/react";
// import { parseWithZod } from "@conform-to/zod";
// import { z } from "zod";

// import { Button } from "~/components/ui/button";
// import { Input } from "~/components/ui/input";
// import { Label, labelVariants } from "~/components/ui/label";
// import { redirectWithToast } from "~/utils/toast.server";
// import { Textarea } from "~/components/ui/textarea";
// import { Checkbox } from "~/components/ui/checkbox";
// import { Separator } from "~/components/ui/separator";
// import { cn } from "~/lib/utils";
// import {
//   HoverCard,
//   HoverCardContent,
//   HoverCardTrigger,
// } from "~/components/ui/hover-card";
// import { groupedPermissions } from "~/utils/permission";
// import { createRole } from "~/services/role.server";
// import { ArrowLeft } from "lucide-react";
// import { requirePermission } from "~/utils/auth.server";

// const schema = z.object({
//   name: z.string(),
//   description: z.string().default("").optional(),
//   permissions: z.array(z.string()),
// });

// export async function action({ request, params }: ActionFunctionArgs) {
//   await requirePermission(request, "manage:iam");

//   const formData = await request.formData();

//   const submission = parseWithZod(formData, { schema });

//   if (submission.status !== "success") {
//     return json(submission.reply());
//   }

//   const { name, description, permissions } = submission.value;

//   await createRole({ name, permissions, description });

//   return redirectWithToast(`/app/iam/roles`, {
//     description: `New role created`,
//     type: "success",
//   });
// }

// export async function loader({ request }: LoaderFunctionArgs) {
//   await requirePermission(request, "manage:iam");

//   return json({ groupedPermissions: groupedPermissions });
// }

// export default function AddNewRole() {
//   const lastResult = useActionData<typeof action>();
//   const { groupedPermissions } = useLoaderData<typeof loader>();
//   const navigate = useNavigate();
//   const { orgId } = useParams<{ orgId: string }>();
//   const navigation = useNavigation();
//   const submitting = navigation.state === "submitting";

//   const [form, fields] = useForm({
//     lastResult,
//     shouldValidate: "onSubmit",
//     onValidate({ formData }) {
//       return parseWithZod(formData, { schema });
//     },
//   });

//   return (
//     <div className="mt-6">
//       <Link
//         to={`/app/${orgId}/iam/roles`}
//         className="font-semibold hover:underline inline-flex items-center gap-1 group"
//       >
//         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 mt-px transition" />{" "}
//         Back to role list
//       </Link>
//       <div className="mt-4 border rounded-lg">
//         <h1 className="text-xl font-bold tracking-tight px-6 py-4">
//           Create New Role
//         </h1>
//         <Separator />
//         <Form
//           className="p-6"
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
//                 <p role="alert" className="text-sm font-semibold text-red-600">
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
//                 <p role="alert" className="text-sm font-semibold text-red-600">
//                   {fields.description.errors}
//                 </p>
//               ) : null}
//             </div>
//             <fieldset>
//               <legend className={cn(labelVariants())}>Permissions</legend>
//               <div className="mt-2 border rounded-lg p-4 pb-8">
//                 {groupedPermissions.map((group, index) => (
//                   <div key={group.groupName}>
//                     {index !== 0 && <Separator className="mt-6 mb-4" />}
//                     <h3 className="mb-4 capitalize font-semibold text-primary">
//                       {group.groupName}
//                     </h3>
//                     <div className="grid grid-cols-5 gap-6">
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
//                           />
//                           <HoverCard>
//                             <HoverCardTrigger>
//                               <Label
//                                 htmlFor={permission.name}
//                                 className="text-base cursor-pointer hover:text-primary truncate"
//                               >
//                                 {permission.name}
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
//               onClick={() => navigate("/app/organizations")}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={submitting}>
//               {submitting ? "Submitting" : "Submit"}
//             </Button>
//           </div>
//         </Form>
//       </div>
//     </div>
//   );
// }

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

import { redirectWithToast } from "~/utils/toast.server";
import { labelVariants } from "~/components/ui/label";
import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { Textarea } from "~/components/ui/textarea";
import {
  createWorkspaceRole,
  requireWorkspacePermission,
} from "~/services/workspace.server";
import { Separator } from "~/components/ui/separator";
import { Checkbox } from "~/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { groupedWorkspacePermissions } from "~/utils/workspace.permission";

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

  console.log({ form });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/workspaces/${id}`)}
      className="overflow-hidden w-full max-w-lg"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        {/* <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Create New Role
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
              <Label htmlFor="description" className={labelVariants()}>
                Description
              </Label>
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
            <div className="grid gap-2">
              <Label htmlFor="description" className={labelVariants()}>
                Privacy
              </Label>
              <RadioGroup
                defaultValue="PUBLIC"
                name="privacy"
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="PUBLIC"
                    id="PUBLIC"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="PUBLIC"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="mb-3 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    Public
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="PRIVATE"
                    id="PRIVATE"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="PRIVATE"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="mb-3 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    Private
                  </Label>
                </div>
              </RadioGroup>
            </div>
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
            >
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form> */}
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
