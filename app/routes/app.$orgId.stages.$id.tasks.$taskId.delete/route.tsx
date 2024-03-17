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
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { Input } from "~/components/ui/input";
import { authenticator } from "~/services/auth.server";
import { deleteTask, getTaskById } from "~/services/task.server";

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
    return redirect(`/app/${organizationId}/stages/${stageId}/tasks`);
  }

  await deleteTask({ organizationId, taskId });

  return redirectWithToast(`/app/${organizationId}/stages/${stageId}/tasks`, {
    description: `Task deleted`,
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

export default function DeleteTask() {
  const { task } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id: stageId, orgId } = useParams<{ id: string; orgId: string }>();
  const [confirmText, setConfirmText] = useState("");
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
            Delete Task
          </Heading>
          <p className="my-4">Are you sure to delete task "{task.name}"?</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{task.name}</span>" to confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/stages/${stageId}/tasks`)}
            >
              Cancel
            </Button>
            <Button
              disabled={task.name !== confirmText || submitting}
              variant="destructive"
              type="submit"
            >
              {submitting ? "Deleting" : "Delete"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
