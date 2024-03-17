import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { now, parseZonedDateTime } from "@internationalized/date";
import { Textarea } from "~/components/ui/textarea";
import { RADatePicker } from "~/components/ui/react-aria/datepicker";
import { createPersonalTask } from "~/services/task.server";
import { requireOrganizationUser } from "~/utils/auth.server";

const schema = z.object({
  name: z.string(),
  description: z.string().optional(),
  dueDate: z.any().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const { name, description, dueDate } = submission.value;

  const formattedDueDate = dueDate
    ? parseZonedDateTime(dueDate).toAbsoluteString()
    : undefined;

  await createPersonalTask({
    name,
    description,
    assigneeId: loggedInUser.id,
    organizationId,
    dueDate: formattedDueDate,
  });

  return redirectWithToast(`/app/${organizationId}/your-tasks`, {
    description: `New task added`,
    type: "success",
  });
}

export default function AddNewTask() {
  const lastSubmission = useActionData<typeof action>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
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
      onOpenChange={() => navigate(`/app/${orgId}/your-tasks`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold mb-4">
            Add New Task
          </Heading>
          <p className="p-2 bg-primary/5 border border-primary text-sm rounded-md mb-2 text-primary">
            This task will be grouped as a personal task
          </p>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Task Name</Label>
              <Input
                id="name"
                autoFocus
                name="name"
                defaultValue={fields.name.defaultValue}
              />
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
                defaultValue={fields.description.defaultValue}
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
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.dueDate.errors}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/your-tasks`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
