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
import { parse } from "@conform-to/zod";
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
import { authenticator } from "~/services/auth.server";
import {
  addProjectClient,
  getClientsAndExcludeSomeIds,
  getProjectById,
} from "~/services/project.server";

const schema = z.object({
  clientId: z.string().uuid("Required"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const { clientId } = submission.value;

  await addProjectClient({ clientId, projectId });

  return redirectWithToast(
    `/app/${organizationId}/projects/${projectId}/clients`,
    {
      description: `New client added`,
      type: "success",
    }
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const project = await getProjectById({ id: projectId, organizationId });

  const existingProjectClientIds =
    project?.projectClients.map((projectClient) => projectClient.clientId) ||
    [];

  if (!project) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const clients = await getClientsAndExcludeSomeIds({
    organizationId,
    excludeIds: existingProjectClientIds,
  });

  return json({ clients });
}
// TODO: Add authorization

export default function AddProjectClient() {
  const lastSubmission = useActionData<typeof action>();
  const { clients } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id, orgId } = useParams<{ id: string; orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/projects/${id}/clients`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" {...form.props}>
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
                {fields.client.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/${orgId}/projects/${id}/clients`)}
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
