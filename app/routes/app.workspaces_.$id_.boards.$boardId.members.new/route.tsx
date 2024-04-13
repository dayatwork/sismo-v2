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
import { UserComboBox } from "~/components/comboboxes/user-combobox";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { addBoardMembers } from "~/services/board.server";
import { type loader as boardLoader } from "../app.workspaces_.$id_.boards.$boardId/route";

const schema = z.object({
  userId: z.string(),
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

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({ submission: submission.reply(), error: null });
  }

  const { userId, isOwner } = submission.value;

  try {
    await addBoardMembers({
      boardId,
      members: [{ isOwner: isOwner || false, userId }],
    });
    return redirectWithToast(
      `/app/workspaces/${workspaceId}/boards/${boardId}`,
      {
        description: `New members added`,
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

export default function AddBoardMember() {
  const actionData = useActionData<typeof action>();
  const routeLoaderData = useRouteLoaderData<typeof boardLoader>(
    "routes/app.workspaces_.$id_.boards.$boardId"
  );
  const navigate = useNavigate();
  const { id, boardId } = useParams<{ id: string; boardId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  const currentBoardMemberIds =
    routeLoaderData?.board.boardMembers.map((bm) => bm.userId) || [];

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
            Add New Member
          </Heading>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="grid gap-1 mt-4">
            <UserComboBox
              name="userId"
              errorMessage={
                fields.userId.errors?.length
                  ? fields.userId.errors.toString()
                  : undefined
              }
              users={routeLoaderData?.users || []}
              defaultValue={fields.userId.initialValue}
              disabledKeys={currentBoardMemberIds}
            />
            {fields.userId.errors && fields.userId.errors.length !== 0 ? (
              <p role="alert" className="text-red-600 text-sm">
                {fields.userId.errors}
              </p>
            ) : null}
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <Switch id="owner" name="isOwner" />
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
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
