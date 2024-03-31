import {
  Form,
  useNavigate,
  useNavigation,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { redirectWithToast } from "~/utils/toast.server";
import { removeBoardMembers } from "~/services/board.server";
import { type loader as boardLoader } from "../app.workspaces_.$id_.boards.$boardId/route";
import { Button } from "~/components/ui/button";

export async function action({ request, params }: ActionFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect("/app/workspaces");
  }

  const boardId = params.boardId;
  if (!boardId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  const memberId = params.memberId;
  if (!memberId) {
    return redirect(`/app/workspaces/${workspaceId}/boards/${boardId}`);
  }

  try {
    await removeBoardMembers({
      boardId,
      members: [{ userId: memberId }],
    });

    return redirectWithToast(
      `/app/workspaces/${workspaceId}/boards/${boardId}`,
      {
        description: `Member removed`,
        type: "success",
      }
    );
  } catch (error: any) {
    return redirectWithToast(
      `/app/workspaces/${workspaceId}/boards/${boardId}`,
      {
        description: `Failed to remove member. ${error.message}`,
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

export default function RemoveBoardMember() {
  const routeLoaderData = useRouteLoaderData<typeof boardLoader>(
    "routes/app.workspaces_.$id_.boards.$boardId"
  );
  const navigate = useNavigate();
  const { id, boardId } = useParams<{ id: string; boardId: string }>();
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
            Remove Board Member
          </Heading>
          <p className="mt-4 mb-2">
            Are you sure to remove this member from board "
            {routeLoaderData?.board.name}"?
          </p>

          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                navigate(`/app/workspaces/${id}/boards/${boardId}`)
              }
            >
              Cancel
            </Button>
            <Button disabled={submitting} variant="destructive" type="submit">
              {submitting ? "Removing" : "Remove"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
