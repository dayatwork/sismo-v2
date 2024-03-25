import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { Modal, Dialog, Heading } from "react-aria-components";
import {
  now,
  parseAbsoluteToLocal,
  parseZonedDateTime,
} from "@internationalized/date";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { Textarea } from "~/components/ui/textarea";
import { RADatePicker } from "~/components/ui/react-aria/datepicker";
import {
  editTask,
  getAssigneeTaskById,
  getTaskById,
} from "~/services/task.server";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  name: z.string(),
  description: z.string().optional(),
  dueDate: z
    .string()
    .transform((dt) => parseZonedDateTime(dt).toDate())
    .pipe(z.date().optional()),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const taskId = params.id;
  if (!taskId) {
    return redirect(`/app/your-tasks`);
  }

  const loggedInUser = await requireUser(request);

  const task = await getAssigneeTaskById({
    assigneeId: loggedInUser.id,
    taskId,
  });

  if (
    !task ||
    task.type === "PROJECT" ||
    ["done", "cancel"].includes(task.status)
  ) {
    return redirect(`/app/your-tasks`);
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { name, description, dueDate } = submission.value;

  await editTask({
    id: taskId,
    name,
    description,
    dueDate,
  });

  return redirectWithToast(`/app/your-tasks`, {
    description: `Task edited`,
    type: "success",
  });
}

export async function loader({ params }: LoaderFunctionArgs) {
  const taskId = params.id;
  if (!taskId) {
    return redirect(`/app/your-tasks`);
  }

  const task = await getTaskById({ id: taskId });

  if (
    !task ||
    task.type === "PROJECT" ||
    ["done", "cancel"].includes(task.status)
  ) {
    return redirect(`/app/your-tasks`);
  }

  return json({ task });
}

export default function EditTask() {
  const lastResult = useActionData<typeof action>();
  const { task } = useLoaderData<typeof loader>();
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
      onOpenChange={() => navigate(`/app/your-tasks`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Edit Task
          </Heading>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Task Name</Label>
              <Input id="name" autoFocus name="name" defaultValue={task.name} />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.name.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Description</Label>
                <span className="text-sm text-muted-foreground leading-none">
                  optional
                </span>
              </div>
              <Textarea
                id="description"
                name="description"
                defaultValue={task.description || undefined}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.description.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <RADatePicker
                optional
                label="Due Date"
                name="dueDate"
                granularity="second"
                placeholderValue={now("Asia/Jakarta")}
                defaultValue={
                  task.dueDate ? parseAbsoluteToLocal(task.dueDate) : undefined
                }
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.dueDate.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/your-tasks`)}
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
