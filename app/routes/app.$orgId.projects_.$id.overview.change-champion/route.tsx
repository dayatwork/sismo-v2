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
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
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
import { getOrganizationUsers } from "~/services/user.server";

const schema = z.object({
  championId: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:project"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const { championId } = submission.value;

  await changeProjectChampion({
    organizationId,
    projectId,
    championId,
  });

  return redirectWithToast(
    `/app/${organizationId}/projects/${projectId}/overview`,
    {
      description: `Project champion changed`,
      type: "success",
    }
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:project"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  const project = await getProjectById({ id: projectId, organizationId });
  if (!project) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const organizationUsers = await getOrganizationUsers(organizationId);

  return json({ project, organizationUsers });
}

export default function ChangeProjectChampion() {
  const lastSubmission = useActionData<typeof action>();
  const { project, organizationUsers } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
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
      onOpenChange={() =>
        navigate(`/app/${orgId}/projects/${project.id}/overview`)
      }
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" {...form.props}>
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
                    {organizationUsers.map((orgUser) => (
                      <ListBoxItem
                        key={orgUser.userId}
                        id={orgUser.userId}
                        value={{ id: orgUser.userId }}
                        className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                      >
                        {orgUser.user.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.serviceId.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() =>
                navigate(`/app/${orgId}/projects/${project.id}/overview`)
              }
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
