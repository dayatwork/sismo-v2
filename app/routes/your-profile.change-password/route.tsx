import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { z } from "zod";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  authenticator,
  changePassword,
  hashPassword,
  verifyPassword,
} from "~/services/auth.server";
import { getUserByIdWithPasswordHash } from "~/services/user.server";

const schema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6, "Minimum 6 characters"),
});

export async function action({ request }: ActionFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const user = await getUserByIdWithPasswordHash(id);
  if (!user) {
    return await authenticator.logout(request, { redirectTo: "/login" });
  }
  if (!user.password) {
    return redirect("/your-profile");
  }

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { oldPassword, newPassword } = submission.value;

  const isOldPasswordCorrect = await verifyPassword(
    oldPassword,
    user.password.hash
  );

  if (!isOldPasswordCorrect) {
    return json({
      ...submission,
      error: {
        oldPassword: ["Invalid credential"],
      },
    });
  }

  const newHashedPassword = await hashPassword(newPassword);

  await changePassword(user.id, newHashedPassword);

  return authenticator.logout(request, { redirectTo: "/login" });
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const lastResult = useActionData<typeof action>();
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
      onOpenChange={() => navigate("/your-profile")}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form
          className="space-y-4"
          method="post"
          id={form.id}
          onSubmit={form.onSubmit}
        >
          <Heading slot="title" className="text-lg font-semibold">
            Change password
          </Heading>
          <div>
            <Label>Old Password</Label>
            <Input id="oldPassword" name="oldPassword" type="password" />
            <p className="text-red-600 text-sm font-medium">
              {fields.oldPassword.errors}
            </p>
          </div>
          <div>
            <Label>New Password</Label>
            <Input id="newPassword" name="newPassword" type="password" />
            <p className="text-red-600 text-sm font-medium">
              {fields.newPassword.errors}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/your-profile")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Changing" : "Change"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
