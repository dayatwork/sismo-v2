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
import {
  addProjectClient,
  getClientsAndExcludeSomeIds,
  getProjectById,
} from "~/services/project.server";
import { requireUser } from "~/utils/auth.server";

const schema = z.object({
  clientId: z.string().uuid("Required"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { clientId } = submission.value;

  await addProjectClient({ clientId, projectId });

  return redirectWithToast(`/app/projects/${projectId}/clients`, {
    description: `New client added`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  const project = await getProjectById({ id: projectId });

  const existingProjectClientIds =
    project?.projectClients.map((projectClient) => projectClient.clientId) ||
    [];

  if (!project) {
    return redirect(`/app/projects`);
  }

  const clients = await getClientsAndExcludeSomeIds({
    excludeIds: existingProjectClientIds,
  });

  return json({ clients });
}

export default function AddProjectClient() {
  const lastResult = useActionData<typeof action>();
  const { clients } = useLoaderData<typeof loader>();
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
      onOpenChange={() => navigate(`/app/projects/${id}/clients`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Add client
          </Heading>
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <Select name="clientId" placeholder="Select a client">
                <Label className={labelVariants()}>Client</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    {clients.map((client) => (
                      <ListBoxItem
                        key={client.id}
                        id={client.id}
                        value={{ id: client.id }}
                        className="px-1 py-1.5 text-sm font-semibold hover:bg-accent rounded cursor-pointer"
                      >
                        {client.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.clientId.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/projects/${id}/clients`)}
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
