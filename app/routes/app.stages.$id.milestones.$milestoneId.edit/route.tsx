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
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";

import { Input } from "~/components/ui/input";
import { labelVariants } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { editMilestone, getMilestoneById } from "~/services/milestone.server";
import { zfd } from "zod-form-data";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  weight: zfd.numeric(z.number().min(0).max(100)),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const milestoneId = params.milestoneId;
  if (!milestoneId) {
    return redirect(`/app/stages/${stageId}/milestones`);
  }

  const formData = await request.formData();
  const descriptionType = typeof formData.get("description");

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { description, name, weight } = submission.value;

  await editMilestone({
    id: milestoneId,
    description: description || (descriptionType === "string" ? "" : undefined),
    name,
    weight,
  });

  return redirectWithToast(`/app/stages/${stageId}/milestones`, {
    description: `Milestone edited`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const milestoneId = params.milestoneId;
  if (!milestoneId) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  const milestone = await getMilestoneById({ id: milestoneId });

  if (!milestone) {
    return redirect(`/app/stages/${stageId}/milestones`);
  }

  return json({ milestone });
}

export default function EditMilestone() {
  const lastResult = useActionData<typeof action>();
  const { milestone } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    defaultValue: {
      name: milestone.name,
      description: milestone.description,
      weight: milestone.weight,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/stages/${id}/milestones`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading className="text-lg font-semibold">Edit milestone</Heading>
          <div className="mt-4 grid gap-4 py-4">
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
              <Label htmlFor="weight" className={labelVariants()}>
                Weight (%)
              </Label>
              <Input
                id="weight"
                name="weight"
                defaultValue={fields.weight.initialValue}
                type="number"
                min={0}
                max={100}
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.weight.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/stages/${id}/milestones`)}
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
