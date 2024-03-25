import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { type ActionFunctionArgs, redirect, json } from "@remix-run/node";
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
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { z } from "zod";

import { redirectWithToast } from "~/utils/toast.server";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { labelVariants } from "~/components/ui/label";
import { selectClassName } from "~/components/ui/select";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";
import { closeProject } from "~/services/project.server";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  closingReason: z.enum(["COMPLETE", "CANCEL"]),
});

export async function action({ params, request }: ActionFunctionArgs) {
  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  await requireUser(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { closingReason } = submission.value;

  await closeProject({ closingReason, projectId });

  return redirectWithToast(`/app/projects/${projectId}/overview`, {
    description: `Project closing`,
    type: "success",
  });
}

export default function CloseProject() {
  const lastResult = useActionData<typeof action>();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
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
      onOpenChange={() => navigate(`/app/projects/${params.id}/overview`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Close Project
          </Heading>
          <p className="my-4">Are you sure to close this project?</p>
          <div className="grid gap-2">
            <Select
              name="closingReason"
              placeholder="Select a reason to close the project"
            >
              <Label className={labelVariants()}>Closing Reason</Label>
              <Button className={cn(selectClassName, "mt-1")}>
                <SelectValue className="flex items-center gap-2" />
                <span aria-hidden="true">
                  <ChevronDownIcon className="w-4 h-4" />
                </span>
              </Button>
              <Popover className="-mt-1 w-full max-w-sm">
                <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                  <ListBoxItem
                    id="COMPLETE"
                    className="px-1 py-1.5 text-sm font-semibold hover:bg-accent rounded cursor-pointer flex items-center gap-2 text-green-600"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Project Completed</span>
                  </ListBoxItem>
                  <ListBoxItem
                    id="CANCEL"
                    className="px-1 py-1.5 text-sm font-semibold hover:bg-accent rounded cursor-pointer flex items-center gap-2 text-red-600"
                  >
                    <XIcon className="w-4 h-4" />
                    <span>Project Cancelled</span>
                  </ListBoxItem>
                </ListBox>
              </Popover>
            </Select>
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {fields.closingReason.errors}
            </p>
          </div>
          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/projects/${params.id}/overview`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                buttonVariants(),
                "bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600"
              )}
              isDisabled={submitting}
            >
              {submitting ? "Closing project" : "Yes, close project"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
