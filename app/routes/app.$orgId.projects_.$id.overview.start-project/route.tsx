import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { startProject } from "~/services/project.server";

export async function action({ params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const projectId = params.id;

  if (!projectId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  await startProject({ organizationId, projectId });

  return redirectWithToast(
    `/app/${organizationId}/projects/${projectId}/overview`,
    {
      description: `Project started`,
      type: "success",
    }
  );
}

export default function StartProject() {
  const navigate = useNavigate();
  const params = useParams<{ id: string; orgId: string }>();
  const navigaton = useNavigation();
  const submitting = navigaton.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() =>
        navigate(`/app/${params.orgId}/projects/${params.id}/overview`)
      }
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Start Project
          </Heading>
          <p className="my-4">Are you sure to start this project?</p>
          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                navigate(`/app/${params.orgId}/projects/${params.id}/overview`)
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              disabled={submitting}
            >
              {submitting ? "Starting project" : "Yes, Start Project"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
