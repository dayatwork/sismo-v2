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
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { Input } from "~/components/ui/input";
import { deleteJobLevel, getJobLevelById } from "~/services/job-level.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const jobLevelId = params.id;

  if (!jobLevelId) {
    return redirect(`/app/${organizationId}/organization/job-level`);
  }

  // const user = await requiredPermission(request, "manage:organization");
  // if (!user) {
  //   return redirectWithToast(`/app/organizations`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  await deleteJobLevel({ id: jobLevelId, organizationId });

  return redirectWithToast(`/app/${organizationId}/organization/job-level`, {
    description: `Job level deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const jobLevelId = params.id;

  if (!jobLevelId) {
    return redirect(`/app/${organizationId}/organization/job-level`);
  }

  // const user = await requiredPermission(request, "manage:organization");
  // if (!user) {
  //   return redirectWithToast(`/app/organizations`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  const jobLevel = await getJobLevelById({ id: jobLevelId, organizationId });

  if (!jobLevel) {
    return redirect(`/app/${organizationId}/organization/job-level`);
  }

  return json({ jobLevel });
}

export default function DeleteJobLevel() {
  const { jobLevel } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/organization/job-level`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Job Level
          </Heading>
          <p className="my-4">Are you sure to delete the "{jobLevel.name}"?</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{jobLevel.name}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/organization/job-level`)}
            >
              Cancel
            </Button>
            <Button
              disabled={jobLevel.name !== confirmText || submitting}
              variant="destructive"
              type="submit"
            >
              {submitting ? "Deleting" : "Delete"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
