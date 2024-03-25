import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { cancelProject, getProjectById } from "~/services/project.server";
import { requireUser } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const projectId = params.id;

  if (!projectId) {
    return redirect(`/app/projects`);
  }

  await requireUser(request);

  const project = await getProjectById({ id: projectId });

  if (!project) {
    return redirect(`/app/projects`);
  }

  if (project.status !== "CLOSING" || project.closingReason !== "CANCEL") {
    return redirectWithToast(`/app/projects/${projectId}/stages`, {
      description: `Only project with status "CLOSING" and closing reason "cancel" can be canceled`,
      type: "error",
    });
  }

  await cancelProject({ projectId });

  return redirectWithToast(`/app/projects/${projectId}/overview`, {
    description: `Project started`,
    type: "success",
  });
}

export default function CompleteProject() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/projects/${params.id}/overview`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Cancel Project
          </Heading>
          <p className="my-4">Are you sure to cancel this project?</p>
          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/projects/${params.id}/overview`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
              disabled={submitting}
            >
              {submitting ? "Cancelling project" : "Yes, cancel project"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
