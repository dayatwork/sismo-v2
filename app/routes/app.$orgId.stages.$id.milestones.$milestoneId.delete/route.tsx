import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";
import { deleteMilestone, getMilestoneById } from "~/services/milestone.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const milestoneId = params.milestoneId;
  if (!milestoneId) {
    return redirect(`/app/${organizationId}/stages/${stageId}/tasks`);
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:project"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  await deleteMilestone({ organizationId, milestoneId });

  return redirectWithToast(
    `/app/${organizationId}/stages/${stageId}/milestones`,
    {
      description: `Milestone deleted`,
      type: "success",
    }
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const milestoneId = params.milestoneId;
  if (!milestoneId) {
    return redirect(`/app/${organizationId}/stages/${stageId}/tasks`);
  }

  const milestone = await getMilestoneById({ id: milestoneId, organizationId });

  if (!milestone) {
    return redirect(`/app/${organizationId}/stages/${stageId}/milestones`);
  }

  return json({ milestone });
}
// TODO: Add authorization

export default function DeleteMilestone() {
  const { milestone } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id: stageId, orgId } = useParams<{ id: string; orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() =>
        navigate(`/app/${orgId}/stages/${stageId}/milestones`)
      }
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Milestone
          </Heading>
          <p className="my-4">
            Are you sure to delete milestone "{milestone.name}"?
          </p>

          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                navigate(`/app/${orgId}/stages/${stageId}/milestones`)
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" type="submit" disabled={submitting}>
              {submitting ? "Deleting" : "Yes, Delete"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
