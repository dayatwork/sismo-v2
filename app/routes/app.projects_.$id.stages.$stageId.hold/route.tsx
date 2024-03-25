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
import { getStageById, holdStage } from "~/services/stage.server";
import { requireUser } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const projectId = params.id;
  const stageId = params.stageId;

  if (!stageId) {
    return redirect(`/app/projects/${projectId}/stages`);
  }

  await requireUser(request);

  await holdStage({ stageId });

  return redirectWithToast(`/app/projects/${projectId}/stages`, {
    description: `Stage onhold`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.id;
  const stageId = params.stageId;

  if (!stageId) {
    return redirect(`/app/projects/${projectId}/stages`);
  }

  await requireUser(request);

  const stage = await getStageById({ id: stageId });

  if (!stage) {
    return redirect(`/app/projects/${projectId}/stages`);
  }

  if (stage.status !== "ONGOING") {
    return redirectWithToast(`/app/projects/${projectId}/stages`, {
      description: `You cannot hold unstarted stage`,
      type: "error",
    });
  }

  return json({ stage });
}

export default function HoldStage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { stage } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/projects/${projectId}/stages`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold capitalize">
            Hold {stage.name}
          </Heading>
          <p className="my-4">Are you sure to hold "{stage.name}"?</p>

          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/projects/${projectId}/stages`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="capitalize bg-orange-600 hover:bg-orange-500"
              disabled={submitting}
            >
              {submitting ? "Holding stage" : `Yes, hold ${stage.name}`}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
