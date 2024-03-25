import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
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
import { changePhoneNumber } from "~/services/user.server";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  phone: z.string({ required_error: "Phone is required" }),
});

export async function action({ request }: ActionFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { phone } = submission.value;

  await changePhoneNumber(loggedInUser.id, phone);

  return redirect("/your-profile");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);

  return json({ user: loggedInUser });
}

export default function EditPhone() {
  const lastResult = useActionData<typeof action>();
  const { user } = useLoaderData<typeof loader>();
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
