import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { getTaskById, removeTaskDueDate } from "~/services/task.server";
import { requireUser } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  const taskId = params.taskId;

  if (!stageId) {
    return redirect(`/app/projects`);
  }

  if (!taskId) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  await removeTaskDueDate({ taskId });

  return redirectWithToast(`/app/stages/${stageId}/tasks`, {
    description: `Due date removed`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  const taskId = params.taskId;

  if (!stageId) {
    return redirect(`/app/projects`);
  }

  if (!taskId) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  const task = await getTaskById({ id: taskId });

  if (!task) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  return json({ task });
}

export default function RemoveTaskDueDate() {
  const { task } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id: stageId } = useParams<{ id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/stages/${stageId}/tasks`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Remove Due Date
          </Heading>
          <p className="my-4">
            Are you sure to to remove due date for task "{task.name}"?
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/stages/${stageId}/tasks`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Removing" : "Yes, remove"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
