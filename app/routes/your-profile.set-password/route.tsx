import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { Dialog, Heading, Modal } from "react-aria-components";

import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authenticator, setPassword } from "~/services/auth.server";
import { getUserByIdWithPasswordHash } from "~/services/user.server";

const schema = z.object({
  password: z.string().min(6, "Minimum 6 characters"),
});

export async function action({ request }: ActionFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const user = await getUserByIdWithPasswordHash(id);
  if (!user) {
    return await authenticator.logout(request, { redirectTo: "/login" });
  }
  if (user.password) {
    return redirect("/your-profile");
  }
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { password } = submission.value;

  await setPassword(user.id, password);

  return authenticator.logout(request, { redirectTo: "/login" });
}

export default function SetPassword() {
  const lastResult = useActionData<typeof action>();
  const navigate = useNavigate();
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
            Set password
          </Heading>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" />
            <p className="text-red-600 text-sm font-medium">
              {fields.password.errors}
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
              {submitting ? "Setting Password" : "Set Password"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
