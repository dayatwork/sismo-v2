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
import { requirePermission, requireUser } from "~/utils/auth.server";
import { deleteMilestone, getMilestoneById } from "~/services/milestone.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const milestoneId = params.milestoneId;
  if (!milestoneId) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  await requirePermission(request, "manage:project");

  await deleteMilestone({ milestoneId });

  return redirectWithToast(`/app/stages/${stageId}/milestones`, {
    description: `Milestone deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const milestoneId = params.milestoneId;
  if (!milestoneId) {
    return redirect(`/app/stages/${stageId}/tasks`);
  }

  await requireUser(request);

  const milestone = await getMilestoneById({ id: milestoneId });

  if (!milestone) {
    return redirect(`/app/stages/${stageId}/milestones`);
  }

  return json({ milestone });
}

export default function DeleteMilestone() {
  const { milestone } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id: stageId } = useParams<{ id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/stages/${stageId}/milestones`)}
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
              onClick={() => navigate(`/app/stages/${stageId}/milestones`)}
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
