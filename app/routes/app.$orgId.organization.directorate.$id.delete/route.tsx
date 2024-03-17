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
import {
  deleteDirectorate,
  getDirectorateById,
} from "~/services/directorate.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const directorateId = params.id;
  if (!directorateId) {
    return redirect(`/app/${organizationId}/organization/directorate`);
  }

  // const user = await requiredPermission(request, "manage:organization");
  // if (!user) {
  //   return redirectWithToast(`/app/organizations`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  await deleteDirectorate({ id: directorateId, organizationId });

  return redirectWithToast(`/app/${organizationId}/organization/directorate`, {
    description: `Directorate deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const directorateId = params.id;
  if (!directorateId) {
    return redirect(`/app/${organizationId}/organization/directorate`);
  }

  // const user = await requiredPermission(request, "manage:organization");
  // if (!user) {
  //   return redirectWithToast(`/app/organizations`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  const directorate = await getDirectorateById({
    id: directorateId,
    organizationId,
  });

  if (!directorate) {
    return redirect(`/app/${organizationId}/organization/directorate`);
  }

  return json({ directorate });
}

export default function DeleteDirectorate() {
  const { directorate } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/organization/directorate`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Directorate
          </Heading>
          <p className="my-4">
            Are you sure to delete the "{directorate.name}"?
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{directorate.name}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/organization/directorate`)}
            >
              Cancel
            </Button>
            <Button
              disabled={directorate.name !== confirmText || submitting}
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
