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

  await deleteProject({ projectId });

  return redirectWithToast(`/app/projects`, {
    description: `Project delete`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  await requireUser(request);

  const project = await getProjectById({ id: projectId });

  if (!project) {
    return redirect(`/app/projects`);
  }

  return json({ project });
}

export default function DeleteProject() {
  const { project } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [confirmText, setConfirmText] = useState("");
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
              onClick={() => navigate(`/app/projects/${params.id}/overview`)}
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
