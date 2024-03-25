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
import { requireUser } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const projectId = params.id;
  const stageId = params.stageId;

  if (!stageId) {
    return redirect(`/app/projects/${projectId}/stages`);
  }

  await requireUser(request);

  await startStage({ stageId });

  return redirectWithToast(`/app/projects/${projectId}/stages`, {
    description: `Stage started`,
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

  return json({ stage });
}

export default function StartStage() {
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
            Start {stage.name}
          </Heading>
          <p className="my-4">Are you sure to start "{stage.name}"?</p>

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
