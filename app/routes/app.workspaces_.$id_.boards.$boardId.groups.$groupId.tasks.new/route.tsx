import {
  Form,
  useActionData,
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
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";
import { now, parseZonedDateTime } from "@internationalized/date";

import { labelVariants } from "~/components/ui/label";
import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { RADateRangePicker } from "~/components/ui/react-aria/date-range-picker";
import { cn } from "~/lib/utils";
import { redirectWithToast } from "~/utils/toast.server";
import { requireUser } from "~/utils/auth.server";
import { createBoardTask } from "~/services/board.server";

const schema = z.object({
  name: z.string(),
  plannedEffortInMinutes: z.number(),
  timelineStart: z
    .string()
    .transform((dt) => parseZonedDateTime(dt).toDate())
    .pipe(z.date()),
  timelineEnd: z
    .string()
    .transform((dt) => parseZonedDateTime(dt).toDate())
    .pipe(z.date()),
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

  const loggedInUser = await requireUser(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json({
      submission: submission.reply(),
      error: null,
      errorTime: null,
    });
  }

  const { name, plannedEffortInMinutes, timelineEnd, timelineStart } =
    submission.value;

  if (timelineStart.getTime() > timelineEnd.getTime()) {
    return json({
      submission,
      error: null,
      errorTime: "End time should greater than start time",
    });
  }

  try {
    await createBoardTask({
      ownerId: loggedInUser.id,
      boardId,
      name,
      groupId,
      plannedEffortInMinutes,
      timelineStart,
      timelineEnd,
    });
    return redirectWithToast(
      `/app/workspaces/${workspaceId}/boards/${boardId}`,
      {
        description: `New task created`,
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

  return null;
}

export default function CreateBoardTask() {
  const actionData = useActionData<typeof action>();
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
            Create New Task
          </Heading>
          {actionData?.error ? (
            <p className="mt-4 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
              {actionData.error.toString()}
            </p>
          ) : null}
          <div className="mt-4 grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className={labelVariants()}>
                Name
              </Label>
              <Input
                id="name"
                autoFocus
                name="name"
                defaultValue={fields.name.initialValue}
              />
              {fields.name.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.name.errors}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="planned-effort" className={labelVariants()}>
                Planned Effort
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="planned-effort"
                  name="plannedEffortInMinutes"
                  defaultValue={fields.plannedEffortInMinutes.initialValue}
                  className="w-20"
                />
                <span className="text-sm font-semibold text-muted-foreground">
                  minutes
                </span>
              </div>
              {fields.plannedEffortInMinutes.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.plannedEffortInMinutes.errors}
                </p>
              ) : null}
            </div>

            <RADateRangePicker
              label="Timeline"
              hourCycle={24}
              startName="timelineStart"
              endName="timelineEnd"
              placeholderValue={now("Asia/Jakarta")}
              hideTimeZone
            />
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {fields.timelineStart.errors || fields.timelineEnd.errors}
            </p>
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
