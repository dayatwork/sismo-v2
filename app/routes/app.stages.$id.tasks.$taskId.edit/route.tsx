import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";

import { Input } from "~/components/ui/input";
import { labelVariants } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { editTask, getTaskById } from "~/services/task.server";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const taskId = params.taskId;
  if (!taskId) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  const formData = await request.formData();
  const descriptionType = typeof formData.get("description");

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { description, name } = submission.value;

  await editTask({
    id: taskId,
    description: description || (descriptionType === "string" ? "" : undefined),
    name,
  });

  return redirectWithToast(`/app/stages/${stageId}/tasks`, {
    description: `Task edited`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const taskId = params.taskId;
  if (!taskId) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  const task = await getTaskById({ id: taskId });

  if (!task) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  return json({ task });
}

export default function EditTask() {
  const lastResult = useActionData<typeof action>();
  const { task } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    defaultValue: {
      name: task.name,
      description: task.description,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/stages/${id}/tasks`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Edit task
          </Heading>
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className={labelVariants()}>
                Task Name
              </Label>
              <Input
                id="name"
                autoFocus
                name="name"
                defaultValue={fields.name.initialValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.name.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description" className={labelVariants()}>
                  Description
                </Label>
                <span className="text-sm text-muted-foreground leading-none">
                  optional
                </span>
              </div>
              <Textarea
                id="description"
                name="description"
                defaultValue={fields.description.initialValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.description.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/stages/${id}/tasks`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(buttonVariants())}
              isDisabled={submitting}
            >
              {submitting ? "Saving" : "Save"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
