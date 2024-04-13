import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Modal, Dialog, Button, Heading } from "react-aria-components";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import { buttonVariants } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { redirectWithToast } from "~/utils/toast.server";
import { updateBoardMemberRole } from "~/services/board.server";
import { type loader as boardLoader } from "../app.workspaces_.$id_.boards.$boardId/route";

const schema = z.object({
  isOwner: z.boolean().optional(),
});

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

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), error: null });
  }

  const { isOwner } = submission.value;

  try {
    await updateBoardMemberRole({
      boardId,
      isOwner: isOwner || false,
      userId: memberId,
    });
    return redirectWithToast(
      `/app/workspaces/${workspaceId}/boards/${boardId}`,
      {
        description: `Member role changed`,
        type: "success",
      }
    );
  } catch (error: any) {
    return json({ submission, error: error.message });
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

export default function ChangeBoardMemberRole() {
  const actionData = useActionData<typeof action>();
  const routeLoaderData = useRouteLoaderData<typeof boardLoader>(
    "routes/app.workspaces_.$id_.boards.$boardId"
  );
  const navigate = useNavigate();
  const { id, boardId, memberId } = useParams<{
    id: string;
    boardId: string;
    memberId: string;
  }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const selectedMember = routeLoaderData?.board.boardMembers.find(
    (bm) => bm.userId === memberId
  );

  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: {
      isOwner: selectedMember?.isOwner,
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/workspaces/${id}/boards/${boardId}`)}
      className="overflow-hidden w-full max-w-lg"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Change Role
          </Heading>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="grid gap-2 mt-6">
            <div className="flex items-center gap-2 -ml-0.5">
              <Avatar>
                <AvatarImage
                  src={selectedMember?.user.photo || ""}
                  className="object-cover"
                />
                <AvatarFallback>{selectedMember?.user.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{selectedMember?.user.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <Switch
              id="owner"
              name="isOwner"
              defaultChecked={fields.isOwner.initialValue === "on"}
            />
            <Label htmlFor="owner">Owner</Label>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() =>
                navigate(`/app/workspaces/${id}/boards/${boardId}`)
              }
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
