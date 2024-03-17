import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { holdProject } from "~/services/project.server";

export async function action({ params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  await holdProject({ organizationId, projectId });

  return redirectWithToast(
    `/app/${organizationId}/projects/${projectId}/overview`,
    {
      description: `Project onhold`,
      type: "success",
    }
  );
}

export default function HoldProject() {
  const navigate = useNavigate();
  const params = useParams<{ id: string; orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

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
            Hold Project
          </Heading>
          <p className="my-4">Are you sure to hold this project?</p>
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
              className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
              disabled={submitting}
            >
              {submitting ? "Holding project" : "Yes, Hold Project"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
