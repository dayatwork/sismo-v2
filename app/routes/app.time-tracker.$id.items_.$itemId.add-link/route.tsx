import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { emitter } from "~/utils/sse/emitter.server";
import { requireUser } from "~/utils/auth.server";
import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { createTrackerAttachmentTypeLink } from "~/services/attachment.server";

const schema = z.object({
  displayName: z.string().min(1, "Required"),
  url: z.string().min(1, "Required"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const trackerId = params.id;
  const trackerItemId = params.itemId;
  if (!trackerId || !trackerItemId) {
    return redirect(`/app/time-tracker`);
  }

  const loggedInUser = await requireUser(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { displayName, url } = submission.value;

  await createTrackerAttachmentTypeLink({
    displayName,
    trackerItemId,
    url,
    ownerId: loggedInUser.id,
  });

  emitter.emit(`tracker-${loggedInUser.id}-changed`);

  return redirectWithToast(`/app/time-tracker`, {
    description: `New link added`,
    type: "success",
  });
}

export default function AddTrackerDocumentLink() {
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
      onOpenChange={() => navigate(`/app/time-tracker`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Add new link
          </Heading>
          <div className="mt-2 grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" name="url" type="url" />
              <p className="text-red-600 text-sm font-medium">
                {fields.url.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" name="displayName" type="displayName" />
              <p className="text-red-600 text-sm font-medium">
                {fields.displayName.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/time-tracker`)}
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
        </Form>
      </Dialog>
    </Modal>
  );
}
