import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  Modal,
  Dialog,
  Label,
  Button,
  Select,
  SelectValue,
  Popover,
  ListBoxItem,
  ListBox,
  Heading,
} from "react-aria-components";

import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { requirePermission } from "~/utils/auth.server";
import {
  changeProjectChampion,
  getProjectById,
} from "~/services/project.server";
import { ChevronDownIcon } from "lucide-react";
import { labelVariants } from "~/components/ui/label";
import { selectClassName } from "~/components/ui/select";
import { getUsers } from "~/services/user.server";

const schema = z.object({
  championId: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  await requirePermission(request, "manage:project");
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { championId } = submission.value;

  await changeProjectChampion({
    projectId,
    championId,
  });

  return redirectWithToast(`/app/projects/${projectId}/overview`, {
    description: `Project champion changed`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  const loggedInUser = await requirePermission(request, "manage:project");
  if (!loggedInUser) {
    return redirect("/app");
  }

  const project = await getProjectById({ id: projectId });
  if (!project) {
    return redirect(`/app/projects`);
  }

  const users = await getUsers();

  return json({ project, users });
}

export default function ChangeProjectChampion() {
  const lastResult = useActionData<typeof action>();
  const { project, users } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
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
      onOpenChange={() => navigate(`/app/projects/${project.id}/overview`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Change Project Champion
          </Heading>
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <Select
                name="championId"
                defaultSelectedKey={project.championId || undefined}
              >
                <Label className={labelVariants()}>Select Champion</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    {users.map((user) => (
                      <ListBoxItem
                        key={user.id}
                        id={user.id}
                        value={{ id: user.id }}
                        className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                      >
                        {user.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.championId.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/projects/${project.id}/overview`)}
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
