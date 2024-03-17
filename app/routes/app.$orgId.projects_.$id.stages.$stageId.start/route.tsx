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
import { getStageById, startStage } from "~/services/stage.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const projectId = params.id;
  const stageId = params.stageId;

  if (!stageId) {
    return redirect(`/app/${organizationId}/projects/${projectId}/stages`);
  }

  await startStage({ stageId, organizationId });

  return redirectWithToast(
    `/app/${organizationId}/projects/${projectId}/stages`,
    {
      description: `Stage started`,
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
  const stageId = params.stageId;

  if (!stageId) {
    return redirect(`/app/${organizationId}/projects/${projectId}/stages`);
  }

  const stage = await getStageById({ id: stageId, organizationId });

  if (!stage) {
    return redirect(`/app/${organizationId}/projects/${projectId}/stages`);
  }

  // if (stage.project.status !== "ONGOING") {
  //   return redirectWithToast(
  //     `/app/${organizationId}/projects/${projectId}/stages`,
  //     {
  //       description: `You cannot start the stage of unstarted project. Please start the project first!`,
  //       type: "error",
  //     }
  //   );
  // }

  return json({ stage });
}
// TODO: Add authorization

export default function StartStage() {
  const { id: projectId, orgId } = useParams<{ id: string; orgId: string }>();
  const { stage } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() =>
        navigate(`/app/${orgId}/projects/${projectId}/stages`)
      }
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold capitalize">
            Start {stage.name}
          </Heading>
          <p className="my-4">Are you sure to start "{stage.name}"?</p>

          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                navigate(`/app/${orgId}/projects/${projectId}/stages`)
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="capitalize bg-blue-600 hover:bg-blue-500 text-white"
              disabled={submitting}
            >
              {submitting ? "Starting stage" : `Yes, start ${stage.name}`}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
