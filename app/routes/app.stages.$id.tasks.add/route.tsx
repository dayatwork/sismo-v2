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
import { now, parseZonedDateTime } from "@internationalized/date";
import { ChevronDownIcon } from "lucide-react";

import { Input } from "~/components/ui/input";
import { labelVariants } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { selectClassName } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { RADatePicker } from "~/components/ui/react-aria/datepicker";
import { createStageTask } from "~/services/task.server";
import { getStageById, getStageMembers } from "~/services/stage.server";
import { getMilestones } from "~/services/milestone.server";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  dueDate: z.any().optional(),
  assigneeId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const stage = await getStageById({ id: stageId });
  if (!stage) {
    return redirect(`/app/projects`);
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { description, dueDate, name, assigneeId, milestoneId } =
    submission.value;

  const formattedDueDate = dueDate
    ? parseZonedDateTime(dueDate).toAbsoluteString()
    : undefined;

  await createStageTask({
    assigneeId,
    dueDate: formattedDueDate,
    name,
    stageId,
    description,
    milestoneId,
  });

  return redirectWithToast(`/app/stages/${stageId}/tasks`, {
    description: `New task created`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const [stageMembers, milestones] = await Promise.all([
    getStageMembers({ stageId }),
    getMilestones({ stageId }),
  ]);

  return json({ stageMembers, milestones });
}

export default function AddNewTask() {
  const lastResult = useActionData<typeof action>();
  const { stageMembers, milestones } = useLoaderData<typeof loader>();
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
            Add new task
          </Heading>
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className={labelVariants()}>
                Task Name
              </Label>
              <Input
                id="name"
                autoFocus
                name="name"
                defaultValue={fields.name.initialValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.name.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description" className={labelVariants()}>
                  Description
                </Label>
                <span className="text-sm text-muted-foreground leading-none">
                  optional
                </span>
              </div>
              <Textarea
                id="description"
                name="description"
                defaultValue={fields.description.initialValue}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.description.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Select name="milestoneId" placeholder="Select a milestone">
                <div className="flex items-center justify-between mb-2">
                  <Label className={labelVariants()}>Milestone</Label>
                  <span className="text-muted-foreground text-sm leading-none">
                    optional
                  </span>
                </div>
                <Button className={cn(selectClassName)}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    {milestones.map((milestone) => (
                      <ListBoxItem
                        key={milestone.id}
                        id={milestone.id}
                        value={{ id: milestone.id }}
                        className="px-1 py-1.5 text-sm font-semibold hover:bg-accent rounded cursor-pointer"
                      >
                        {milestone.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.milestoneId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Select name="assigneeId" placeholder="Select a assignee">
                <div className="flex items-center justify-between mb-2">
                  <Label className={labelVariants()}>Assignee</Label>
                  <span className="text-muted-foreground text-sm leading-none">
                    optional
                  </span>
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
            <div className="grid gap-2">
              <RADatePicker
                optional
                label="Due Date"
                name="dueDate"
                granularity="second"
                placeholderValue={now("Asia/Jakarta")}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.dueDate.errors}
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
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
