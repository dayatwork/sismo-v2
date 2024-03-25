import {
  Form,
  useActionData,
  useLoaderData,
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
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  Modal,
  Dialog,
  Select,
  Label,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Heading,
} from "react-aria-components";
import { ChevronDownIcon } from "lucide-react";

import { labelVariants } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { selectClassName } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { assignTask } from "~/services/task.server";
import { getStageMembers } from "~/services/stage.server";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  assigneeId: z.string().uuid(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const taskId = params.taskId;
  if (!taskId) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { assigneeId } = submission.value;

  await assignTask({ assigneeId, taskId });

  return redirectWithToast(`/app/stages/${stageId}/tasks`, {
    description: `Task assigned`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const stageMembers = await getStageMembers({ stageId });

  return json({ stageMembers });
}

export default function AssignTask() {
  const lastResult = useActionData<typeof action>();
  const { stageMembers } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/stages/${id}/tasks`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Assign task
          </Heading>
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <Select name="assigneeId" placeholder="Select a assignee">
                <div className="flex items-center justify-between mb-2">
                  <Label className={labelVariants()}>Assignee</Label>
                </div>
                <Button className={cn(selectClassName)}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    {stageMembers.map((stageMember) => (
                      <ListBoxItem
                        key={stageMember.userId}
                        id={stageMember.userId}
                        value={{ id: stageMember.userId }}
                        className="px-1 py-1.5 text-sm font-semibold hover:bg-accent rounded cursor-pointer"
                      >
                        {stageMember.user.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.assigneeId.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/stages/${id}/tasks`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(buttonVariants())}
              isDisabled={submitting}
            >
              {submitting ? "Assigning" : "Assign"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
