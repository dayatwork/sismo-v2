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
import { authenticator } from "~/services/auth.server";
import { Input } from "~/components/ui/input";
import { createTaskAttachmentTypeLink } from "~/services/attachment.server";

const schema = z.object({
  displayName: z.string().min(1, "Required"),
  url: z.string().min(1, "Required"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const taskId = params.taskId;
  if (!taskId) {
    return redirect(`/app/${organizationId}/stages/${stageId}/tasks`);
  }

  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { displayName, url } = submission.value;

  await createTaskAttachmentTypeLink({
    displayName,
    organizationId,
    taskId,
    url,
    userId,
  });

  return redirectWithToast(
    `/app/${organizationId}/stages/${stageId}/tasks/${taskId}/details`,
    {
      description: `New link added`,
      type: "success",
    }
  );
}

export default function AddTaskDocumentLink() {
  const lastResult = useActionData<typeof action>();
  const navigate = useNavigate();
  const {
    id: stageId,
    taskId,
    orgId,
  } = useParams<{ id: string; taskId: string; orgId: string }>();
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
        navigate(`/app/${orgId}/stages/${stageId}/tasks/${taskId}/details`)
      }
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Add new link
          </Heading>
          <div className="mt-2 grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" name="displayName" type="displayName" />
              <p className="text-red-600 text-sm font-medium">
                {fields.displayName.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" name="url" type="url" />
              <p className="text-red-600 text-sm font-medium">
                {fields.url.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() =>
                navigate(
                  `/app/${orgId}/stages/${stageId}/tasks/${taskId}/details`
                )
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
