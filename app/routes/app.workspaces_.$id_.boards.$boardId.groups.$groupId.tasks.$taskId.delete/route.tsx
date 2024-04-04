import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Modal, Dialog, Button, Heading } from "react-aria-components";

import { buttonVariants } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requireUser } from "~/utils/auth.server";
import { deleteBoardTask } from "~/services/board.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect("/app/workspaces");
  }

  const boardId = params.boardId;
  if (!boardId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  const groupId = params.groupId;
  if (!groupId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  const taskId = params.taskId;
  if (!taskId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  await requireUser(request);

  try {
    await deleteBoardTask({
      id: taskId,
    });
    return redirectWithToast(
      `/app/workspaces/${workspaceId}/boards/${boardId}`,
      {
        description: `Task deleted`,
        type: "success",
      }
    );
  } catch (error: any) {
    return redirectWithToast(
      `/app/workspaces/${workspaceId}/boards/${boardId}`,
      {
        description: `Failed to delete task. ${error.message} `,
        type: "error",
      }
    );
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect("/app/workspaces");
  }

  const boardId = params.boardId;
  if (!boardId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  return null;
}

export default function DeleteBoardTask() {
  const navigate = useNavigate();
  const { id, boardId } = useParams<{
    id: string;
    boardId: string;
  }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/workspaces/${id}/boards/${boardId}`)}
      className="overflow-hidden w-full max-w-lg"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Task
          </Heading>
          <p className="mt-4 mb-2">Are you sure to delete this task?</p>

          <p className="mt-2 mb-2  text-red-600">
            This action cannot be undone!
          </p>

          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              onPress={() =>
                navigate(`/app/workspaces/${id}/boards/${boardId}`)
              }
              className={buttonVariants({ variant: "ghost" })}
            >
              Cancel
            </Button>
            <Button
              isDisabled={submitting}
              className={buttonVariants({ variant: "destructive" })}
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
