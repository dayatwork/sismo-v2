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
import { addStageMember, getStageMembers } from "~/services/stage.server";
import { getOrganizationUsersAndExcludeSomeIds } from "~/services/organization.server";

const schema = z.object({
  userId: z.string().uuid("Required"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { userId } = submission.value;

  await addStageMember({ stageId, userId });

  return redirectWithToast(`/app/${organizationId}/stages/${stageId}/members`, {
    description: `New member added`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const stageMembers = await getStageMembers({ stageId });

  const existingUserIds = stageMembers?.map((member) => member.userId) || [];

  const organizationUsers = await getOrganizationUsersAndExcludeSomeIds({
    organizationId,
    excludeIds: existingUserIds,
  });

  return json({ organizationUsers });
}
// TODO: Add authorization

export default function AddStageMember() {
  const lastResult = useActionData<typeof action>();
  const { organizationUsers } = useLoaderData<typeof loader>();
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

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/stages/${id}/members`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Add member
          </Heading>
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <Select name="userId" placeholder="Select a user">
                <Label className={labelVariants()}>User</Label>
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
                        className="px-1 py-1.5 text-sm font-semibold hover:bg-accent rounded cursor-pointer"
                      >
                        {orgUser.user.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.userId.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/${orgId}/stages/${id}/members`)}
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
