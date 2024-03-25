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
import {
  deleteDirectorate,
  getDirectorateById,
} from "~/services/directorate.server";
import { requirePermission } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const directorateId = params.id;
  if (!directorateId) {
    return redirect(`/app/organization/directorate`);
  }

  await requirePermission(request, "manage:organization");

  // const user = await requiredPermission(request, "manage:organization");
  // if (!user) {
  //   return redirectWithToast(`/app/organizations`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  await deleteDirectorate({ id: directorateId });

  return redirectWithToast(`/app/organization/directorate`, {
    description: `Directorate deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const directorateId = params.id;
  if (!directorateId) {
    return redirect(`/app/organization/directorate`);
  }

  await requirePermission(request, "manage:organization");

  const directorate = await getDirectorateById({
    id: directorateId,
  });

  if (!directorate) {
    return redirect(`/app/organization/directorate`);
  }

  return json({ directorate });
}

export default function DeleteDirectorate() {
  const { directorate } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/organization/directorate`)}
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
              onClick={() => navigate(`/app/organization/directorate`)}
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
