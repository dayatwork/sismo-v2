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
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { Modal, Dialog, Button, Heading } from "react-aria-components";
import {
  now,
  parseAbsoluteToLocal,
  parseZonedDateTime,
} from "@internationalized/date";

import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { authenticator } from "~/services/auth.server";
import { RADatePicker } from "~/components/ui/react-aria/datepicker";
import { changeTaskDueDate, getTaskById } from "~/services/task.server";

const schema = z.object({
  dueDate: z.any(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }
  const taskId = params.taskId;
  if (!taskId) {
    return redirect(`/app/${organizationId}/stages/${stageId}/tasks`);
  }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const { dueDate } = submission.value;

  const formattedDueDate =
    parseZonedDateTime(dueDate).toAbsoluteString() || undefined;

  await changeTaskDueDate({
    organizationId,
    taskId,
    dueDate: formattedDueDate,
  });

  return redirectWithToast(`/app/${organizationId}/stages/${stageId}/tasks`, {
    description: `Due date updated`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const taskId = params.taskId;
  if (!taskId) {
    return redirect(`/app/${organizationId}/stages/${stageId}/tasks`);
  }

  const task = await getTaskById({ id: taskId, organizationId });
  if (!task) {
    return redirect(`/app/${organizationId}/stages/${stageId}/tasks`);
  }

  return json({ task });
}
// TODO: Add authorization

export default function ChangeTaskDueDate() {
  const lastSubmission = useActionData<typeof action>();
  const { task } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id, orgId } = useParams<{ id: string; orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
    defaultValue: {
      dueDate: task.dueDate,
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/stages/${id}/tasks`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold">
            {task.dueDate ? "Change Due Date" : "Set Due Date"}
          </Heading>
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <RADatePicker
                label="Due Date"
                name="dueDate"
                granularity="second"
                placeholderValue={now("Asia/Jakarta")}
                defaultValue={
                  fields.dueDate.defaultValue
                    ? parseAbsoluteToLocal(fields.dueDate.defaultValue)
                    : undefined
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
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/${orgId}/stages/${id}/tasks`)}
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
