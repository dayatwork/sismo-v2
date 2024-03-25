import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
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
import { requirePermission } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const jobLevelId = params.id;
  if (!jobLevelId) {
    return redirect(`/app/organization/job-level`);
  }

  await requirePermission(request, "manage:organization");

  await deleteJobLevel({ id: jobLevelId });

  return redirectWithToast(`/app/organization/job-level`, {
    description: `Job level deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const jobLevelId = params.id;

  if (!jobLevelId) {
    return redirect(`/app/organization/job-level`);
  }

  await requirePermission(request, "manage:organization");

  const jobLevel = await getJobLevelById({ id: jobLevelId });
  if (!jobLevel) {
    return redirect(`/app/organization/job-level`);
  }

  return json({ jobLevel });
}

export default function DeleteJobLevel() {
  const { jobLevel } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/organization/job-level`)}
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
              onClick={() => navigate(`/app/organization/job-level`)}
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
