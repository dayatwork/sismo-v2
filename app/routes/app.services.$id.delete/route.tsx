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
import { requirePermission } from "~/utils/auth.server";
import { deleteService, getServiceById } from "~/services/service.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const serviceId = params.id;
  if (!serviceId) {
    return redirect(`/app/services`);
  }

  await requirePermission(request, "manage:service");

  await deleteService({ serviceId });

  return redirectWithToast(`/app/services`, {
    description: `Service deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const serviceId = params.id;
  if (!serviceId) {
    return redirect(`/app/services`);
  }

  await requirePermission(request, "manage:service");

  const service = await getServiceById({ serviceId });

  if (!service) {
    return redirect(`/app/services`);
  }

  return json({ service });
}

export default function DeleteService() {
  const { service } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/services`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Service
          </Heading>
          <p className="my-4">
            Are you sure to delete service "{service.name}"?
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{service.code}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/services`)}
            >
              Cancel
            </Button>
            <Button
              disabled={service.code !== confirmText || submitting}
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
