import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";

import { labelVariants } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { createStage } from "~/services/stage.server";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { description, name } = submission.value;

  await createStage({ description, name, projectId });

  return redirectWithToast(`/app/projects/${projectId}/stages`, {
    description: `New stage created`,
    type: "success",
  });
}

export default function CreateNewStage() {
  const lastResult = useActionData<typeof action>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
      onOpenChange={() => navigate(`/app/projects/${id}/stages`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Create New Stage
          </Heading>
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
                defaultValue={fields.name.initialValue}
              />
              {fields.description.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.description.errors}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/projects/${id}/stages`)}
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
