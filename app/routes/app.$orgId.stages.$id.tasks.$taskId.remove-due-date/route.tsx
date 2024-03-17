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
import { authenticator } from "~/services/auth.server";
import { getTaskById, removeTaskDueDate } from "~/services/task.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });
  const stageId = params.id;
  const taskId = params.taskId;

  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  if (!taskId) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  await removeTaskDueDate({ organizationId, taskId });

  return redirectWithToast(`/app/${organizationId}/stages/${stageId}/tasks`, {
    description: `Due date removed`,
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
  const taskId = params.taskId;

  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

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

export default function RemoveTaskDueDate() {
  const { task } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id: stageId, orgId } = useParams<{ id: string; orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/stages/${stageId}/tasks`)}
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
              onClick={() => navigate(`/app/${orgId}/stages/${stageId}/tasks`)}
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
