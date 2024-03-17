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
import {
  deleteTaskById,
  getAssigneeTaskById,
  getTaskById,
} from "~/services/task.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const taskId = params.id;
  if (!taskId) {
    return redirect(`/app/${organizationId}/your-tasks`);
  }

  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const task = await getAssigneeTaskById({
    taskId,
    organizationId,
    assigneeId: userId,
  });

  if (
    !task ||
    task.type === "PROJECT" ||
    ["done", "cancel"].includes(task.status)
  ) {
    return redirect(`/app/${organizationId}/your-tasks`);
  }

  await deleteTaskById({ id: task.id });

  return redirectWithToast(`/app/${organizationId}/your-tasks`, {
    description: `Task deleted`,
    type: "success",
  });
}

export async function loader({ params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const taskId = params.id;
  if (!taskId) {
    return redirect(`/app/${organizationId}/your-tasks`);
  }

  const task = await getTaskById({ id: taskId, organizationId });

  if (
    !task ||
    task.type === "PROJECT" ||
    ["done", "cancel"].includes(task.status)
  ) {
    return redirect(`/app/${organizationId}/your-tasks`);
  }

  return json({ task });
}

export default function DeleteTask() {
  const { task } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/your-tasks`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Task
          </Heading>
          <p className="my-4">Are you sure to delete "{task.name}"?</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{task.code}</span>" to confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/your-tasks`)}
            >
              Cancel
            </Button>
            <Button
              disabled={task.code !== confirmText || submitting}
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
