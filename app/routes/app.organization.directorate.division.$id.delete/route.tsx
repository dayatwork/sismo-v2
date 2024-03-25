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
import { deleteDivision, getDivisionById } from "~/services/division.server";
import { requirePermission } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const divisionId = params.id;
  if (!divisionId) {
    return redirect(`/app/organization/directorate`);
  }

  await requirePermission(request, "manage:organization");

  await deleteDivision({ id: divisionId });

  return redirectWithToast(`/app/organization/directorate`, {
    description: `Division deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const divisionId = params.id;
  if (!divisionId) {
    return redirect(`/app/organization/directorate`);
  }

  await requirePermission(request, "manage:organization");

  const division = await getDivisionById({ id: divisionId });

  if (!division) {
    return redirect(`/app/organization/directorate`);
  }

  return json({ division });
}

export default function DeleteDivision() {
  const { division } = useLoaderData<typeof loader>();
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
            Delete Division
          </Heading>
          <p className="my-4">Are you sure to delete the "{division.name}"?</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{division.name}</span>" to
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
              disabled={division.name !== confirmText || submitting}
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
