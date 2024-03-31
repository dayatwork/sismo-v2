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
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import { redirectWithToast } from "~/utils/toast.server";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { editBoardTask } from "~/services/board.server";
import { requireUser } from "~/utils/auth.server";
import { type loader as boardLoader } from "../app.workspaces_.$id_.boards.$boardId/route";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  BacklogIcon,
  DoneIcon,
  InProgressIcon,
  OnHoldIcon,
  TodoIcon,
} from "~/components/icons";

const schema = z.object({
  status: z.enum([
    "DONE",
    "IN_PROGRESS",
    "TODO",
    "BACKLOG",
    "STUCK",
    "ON_HOLD",
  ]),
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

  const groupId = params.groupId;
  if (!groupId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  const taskId = params.taskId;
  if (!taskId) {
    return redirect(`/app/workspaces/${workspaceId}`);
  }

  await requireUser(request);

  // const { allowed } = await requireWorkspacePermission(
  //   request,
  //   workspaceId,
  //   "manage:board"
  // );
  // if (!allowed) {
  //   return redirectWithToast(`/app/workspaces/${workspaceId}`, {
  //     description: `Unauthorized`,
  //     type: "error",
  //   });
  // }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({
      submission: submission.reply(),
      error: null,
    });
  }

  const { status } = submission.value;

  try {
    await editBoardTask({
      id: taskId,
      status,
    });
    return redirectWithToast(
      `/app/workspaces/${workspaceId}/boards/${boardId}`,
      {
        description: `Status changed`,
        type: "success",
      }
    );
  } catch (error: any) {
    return json({ submission, error: error.message, errorTime: null });
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

  // const { allowed } = await requireWorkspacePermission(
  //   request,
  //   workspaceId,
  //   "manage:board"
  // );
  // if (!allowed) {
  //   return redirect(`/app/workspace/${workspaceId}`);
  // }

  return null;
}

export default function ChangeBoardTaskStatus() {
  const actionData = useActionData<typeof action>();
  const routeLoaderData = useRouteLoaderData<typeof boardLoader>(
    "routes/app.workspaces_.$id_.boards.$boardId"
  );
  const navigate = useNavigate();
  const { id, boardId, taskId, groupId } = useParams<{
    id: string;
    boardId: string;
    groupId: string;
    taskId: string;
  }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const selectedTask = routeLoaderData?.board.taskGroups
    .find((tg) => tg.id === groupId)
    ?.tasks.find((task) => task.id === taskId);

  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: {
      status: selectedTask?.status,
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/workspaces/${id}/boards/${boardId}`)}
      className="overflow-hidden w-full max-w-2xl"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Change Task Status
          </Heading>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="grid gap-2 mt-4">
            <RadioGroup
              defaultValue={fields.status.initialValue}
              name="status"
              className="grid grid-cols-5 gap-2"
              autoFocus
            >
              <div>
                <RadioGroupItem
                  value="BACKLOG"
                  id="BACKLOG"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="BACKLOG"
                  className="flex flex-col gap-2 font-semibold text-sm items-center justify-between rounded-md border-2 border-muted bg-popover px-3 py-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <BacklogIcon />
                  Open
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="TODO"
                  id="TODO"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="TODO"
                  className="flex flex-col gap-2 font-semibold text-sm items-center justify-between rounded-md border-2 border-muted bg-popover px-3 py-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <TodoIcon />
                  Todo
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="IN_PROGRESS"
                  id="IN_PROGRESS"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="IN_PROGRESS"
                  className="flex flex-col gap-2 font-semibold text-sm items-center justify-between rounded-md border-2 border-muted bg-popover px-3 py-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <InProgressIcon />
                  In Progress
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="ON_HOLD"
                  id="ON_HOLD"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="ON_HOLD"
                  className="flex flex-col gap-2 font-semibold text-sm items-center justify-between rounded-md border-2 border-muted bg-popover px-3 py-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <OnHoldIcon />
                  On Hold
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="DONE"
                  id="DONE"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="DONE"
                  className="flex flex-col gap-2 font-semibold text-sm items-center justify-between rounded-md border-2 border-muted bg-popover px-3 py-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <DoneIcon />
                  Done
                </Label>
              </div>
            </RadioGroup>
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
              {submitting ? "Changing" : "Change"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
