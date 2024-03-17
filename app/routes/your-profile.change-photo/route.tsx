import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { z } from "zod";
import { Dialog, Heading, Modal } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authenticator } from "~/services/auth.server";
import { changeUserPhoto, getUserById } from "~/services/user.server";

const schema = z.object({
  photo: z.instanceof(File, { message: "Photo is required" }),
});

export async function action({ request }: ActionFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUserById(id);
  if (!user) {
    return await authenticator.logout(request, { redirectTo: "/login" });
  }

  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const { photo } = submission.value;

  await changeUserPhoto({ userId: id, photo });

  return redirect("/your-profile");
}

export default function ChangePhoto() {
  const navigate = useNavigate();
  const lastSubmission = useActionData<typeof action>();
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
        <Form
          className="space-y-4"
          encType="multipart/form-data"
          method="post"
          {...form.props}
        >
          <Heading slot="title" className="text-lg font-semibold">
            Change photo
          </Heading>
          <div>
            <Label>Photo</Label>
            <Input id="photo" name="photo" type="file" />
            <p className="text-red-600 text-sm font-medium">
              {fields.photo.errors}
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
