import { redirect, type ActionFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { Dialog, Modal, Label, Button, Heading } from "react-aria-components";
import { useForm } from "@conform-to/react";
import { z } from "zod";
import { parse } from "@conform-to/zod";

import { addOrganizationAdmin } from "~/services/organization.server";
import { getUserById } from "~/services/user.server";
import { Input } from "~/components/ui/input";
import { authenticator } from "~/services/auth.server";
import { redirectWithToast } from "~/utils/toast.server";
import { labelVariants } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  memberId: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.id;
  if (!organizationId) {
    return redirect("/admin/organizations");
  }

  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUserById(id);

  if (!user) {
    return await authenticator.logout(request, { redirectTo: "/login" });
  }

  if (!user.isSuperAdmin) {
    return redirectWithToast("/app", {
      description: "Unauthorized!",
      type: "error",
    });
  }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json({ submission, error: null });
  }

  const { email, memberId, name, password } = submission.value;

  // const name = formData.get("name") as string;
  // const email = formData.get("email") as string;
  // const password = (formData.get("password") as string) || undefined;

  try {
    await addOrganizationAdmin({
      email,
      name,
      password: password || undefined,
      organizationId,
      memberId,
    });
    return redirectWithToast("/admin/organizations", {
      description: "New admin added!",
      type: "success",
    });
  } catch (error: any) {
    return json({ submission, error: error.message });
  }
}

export default function AdminAddOrganizationAdmin() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastSubmission: actionData?.submission,
    shouldValidate: "onSubmit",
  });

  const handleClose = () => navigate("/admin/organizations");

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={handleClose}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6">
        <Form method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold mb-6">
            Add Organization's Admin
          </Heading>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="space-y-6 mt-4">
            <div className="grid gap-2">
              <Label className={labelVariants()}>Name</Label>
              <Input name="name" required />
              {fields.name.errors ? (
                <p
                  role="alert"
                  className="text-sm font-semibold text-red-600 leading-none"
                >
                  {fields.name.errors}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label className={labelVariants()}>Email</Label>
              <Input name="email" type="email" required />
              {fields.email.errors ? (
                <p
                  role="alert"
                  className="text-sm font-semibold text-red-600 leading-none"
                >
                  {fields.email.errors}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label className={labelVariants()}>Password</Label>
                <p className="text-sm text-muted-foreground leading-none">
                  Optional
                </p>
              </div>
              <Input name="password" type="password" />
              <p className="text-sm text-muted-foreground">
                If password not set you can still login using Gmail
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="memberId" className={labelVariants()}>
                Member ID
              </Label>
              <Input
                id="memberId"
                autoFocus
                name="memberId"
                defaultValue={fields.memberId.defaultValue}
              />
              {fields.memberId.errors ? (
                <p
                  role="alert"
                  className="text-sm font-semibold text-red-600 leading-none"
                >
                  {fields.memberId.errors}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-10 flex justify-end gap-4">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(buttonVariants())}
              isDisabled={submitting}
            >
              {submitting ? "Adding" : "Add"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
