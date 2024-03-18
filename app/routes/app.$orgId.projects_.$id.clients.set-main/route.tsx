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
import { authenticator } from "~/services/auth.server";
import {
  getProjectClientById,
  getProjectClients,
  setMainClient,
} from "~/services/project.server";

const schema = z.object({
  projectClientId: z.string().uuid("Required"),
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

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { projectClientId } = submission.value;

  const projectClient = await getProjectClientById({ id: projectClientId });

  if (!projectClient) {
    return redirectWithToast(
      `/app/${organizationId}/projects/${projectId}/clients`,
      {
        description: "Client not found",
        type: "error",
      }
    );
  }

  await setMainClient({ projectClientId, projectId });

  return redirectWithToast(
    `/app/${organizationId}/projects/${projectId}/clients`,
    {
      description: `New main client set`,
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

  const projectClients = await getProjectClients({ projectId });

  return json({ projectClients });
}
// TODO: Add authorization

export default function SetProjectMainClient() {
  const lastResult = useActionData<typeof action>();
  const { projectClients } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id, orgId } = useParams<{ id: string; orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  const mainClientIds = projectClients
    .filter((pc) => pc.isMain)
    .map((pc) => pc.id);

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/projects/${id}/clients`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Set main client
          </Heading>
          <p className="text-muted-foreground">Project code will be change</p>
          <div className="mt-2 grid gap-4 py-4">
            <div className="grid gap-2">
              <Select
                name="projectClientId"
                placeholder="Select a client"
                disabledKeys={mainClientIds}
              >
                <Label className={labelVariants()}>Main Client</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1">
                    {projectClients.map((projectClient) => (
                      <ListBoxItem
                        key={projectClient.id}
                        id={projectClient.id}
                        value={{ id: projectClient.id }}
                        className={cn(
                          mainClientIds.includes(projectClient.id)
                            ? "cursor-not-allowed text-muted-foreground"
                            : "cursor-pointer hover:bg-accent",
                          "px-1 py-1.5 text-sm font-semibold rounded flex items-center justify-between gap-2"
                        )}
                      >
                        <span>{projectClient.client.name}</span>
                        {projectClient.isMain && (
                          <span className="text-muted-foreground">
                            Current Main Client
                          </span>
                        )}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.projectClientId.errors}
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
