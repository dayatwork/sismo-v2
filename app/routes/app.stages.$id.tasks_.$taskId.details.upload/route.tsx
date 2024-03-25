import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import { redirectWithToast } from "~/utils/toast.server";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { getTaskById } from "~/services/task.server";
import { createTaskAttachmentTypeFile } from "~/services/attachment.server";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  file: z.instanceof(File, { message: "File is required" }),
  displayName: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const stageId = params.id;

  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const taskId = params.taskId;
  if (!taskId) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  const loggedInUser = await requireUser(request);

  const task = await getTaskById({ id: taskId });

  if (!task) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { file, displayName } = submission.value;

  await createTaskAttachmentTypeFile({
    file,
    taskId,
    userId: loggedInUser.id,
    displayName,
  });

  return redirectWithToast(`/app/stages/${stageId}/tasks/${taskId}/details`, {
    description: `New document uploaded`,
    type: "success",
  });
}

export default function UploadTaskDocument() {
  const lastResult = useActionData<typeof action>();
  const navigate = useNavigate();
  const { id: stageId, taskId } = useParams<{ id: string; taskId: string }>();
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
      onOpenChange={() =>
        navigate(`/app/stages/${stageId}/tasks/${taskId}/details`)
      }
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form
          encType="multipart/form-data"
          method="post"
          id={form.id}
          onSubmit={form.onSubmit}
        >
          <Heading className="text-lg font-semibold">Upload Document</Heading>
          <div className="mt-2 grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>File</Label>
              <Input id="file" name="file" type="file" />
              <p className="text-red-600 text-sm font-medium">
                {fields.file.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="displayName">Display Name</Label>
                <p className="text-muted-foreground leading-none text-sm">
                  Optional
                </p>
              </div>
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
              onPress={() =>
                navigate(`/app/stages/${stageId}/tasks/${taskId}/details`)
              }
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
