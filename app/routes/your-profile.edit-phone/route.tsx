import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { Dialog, Heading, Modal } from "react-aria-components";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authenticator } from "~/services/auth.server";
import { changePhoneNumber, getUserById } from "~/services/user.server";

const schema = z.object({
  phone: z.string({ required_error: "Phone is required" }),
});

export async function action({ request }: ActionFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const { phone } = submission.value;

  await changePhoneNumber(id, phone);

  return redirect("/your-profile");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUserById(id);
  if (!user) {
    return await authenticator.logout(request, { redirectTo: "/login" });
  }

  return json({ user });
}

export default function EditPhone() {
  const lastSubmission = useActionData<typeof action>();
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate("/your-profile")}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form className="space-y-4" method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold">
            Edit phone number
          </Heading>
          <div className="grid gap-2">
            <Label>Phone number</Label>
            <Input
              required
              id="phone"
              name="phone"
              defaultValue={user.phone || undefined}
            />
            <p className="text-red-600 text-sm font-medium">
              {fields.phone.errors}
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
              {submitting ? "Saving" : "Save"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
