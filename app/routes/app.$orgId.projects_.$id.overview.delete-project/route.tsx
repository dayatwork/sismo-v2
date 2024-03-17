import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { deleteProject, getProjectById } from "~/services/project.server";
import { useState } from "react";
import { Input } from "~/components/ui/input";

export async function action({ params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const projectId = params.id;

  if (!projectId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const project = await getProjectById({ id: projectId, organizationId });

  if (!project) {
    return redirect(`/app/${organizationId}/projects`);
  }

  // TODO: Add condition for deleting project

  await deleteProject({ organizationId, projectId });

  return redirectWithToast(`/app/${organizationId}/projects`, {
    description: `Project delete`,
    type: "success",
  });
}

export async function loader({ params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const project = await getProjectById({ id: projectId, organizationId });

  if (!project) {
    return redirect(`/app/${organizationId}/projects`);
  }

  return json({ project });
}

export default function DeleteProject() {
  const { project } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const params = useParams<{ id: string; orgId: string }>();
  const [confirmText, setConfirmText] = useState("");
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
            Delete Project
          </Heading>
          <p className="my-4">Are you sure to delete this project?</p>
          <p className="my-4">This action cannot be undone</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{project.code}</span>" to
            confirm
          </p>
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
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
              disabled={project.code !== confirmText || submitting}
            >
              {submitting ? "Deleting project" : "Yes, delete project"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
