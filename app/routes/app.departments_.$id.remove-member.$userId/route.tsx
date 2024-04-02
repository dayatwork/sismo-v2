import { useState } from "react";
import {
  Form,
  useNavigate,
  useNavigation,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { redirectWithToast } from "~/utils/toast.server";
import { requirePermission } from "~/utils/auth.server";
import { removeDepartmentMembers } from "~/services/department.server";
import { type loader as departmentIdLoader } from "../app.departments_.$id/route";

export async function action({ request, params }: ActionFunctionArgs) {
  const departmentId = params.id;
  const userId = params.userId;
  if (!departmentId || !userId) {
    return redirect(`/app/departments`);
  }

  await requirePermission(request, "manage:department");

  await removeDepartmentMembers({
    departmentId,
    members: [{ userId }],
  });

  return redirectWithToast(`/app/departments/${departmentId}`, {
    description: `Member removed`,
    type: "success",
  });
}

export default function RemoveMember() {
  const loaderData = useRouteLoaderData<typeof departmentIdLoader>(
    "routes/app.departments_.$id"
  );

  const navigate = useNavigate();
  const { id, userId } = useParams<{
    id: string;
    userId: string;
  }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const departmentName = loaderData?.department.name || "";
  const userName =
    loaderData?.department.departmentMembers.find((dm) => dm.userId === userId)
      ?.user.name || "";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/departments/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Remove member
          </Heading>
          <p className="my-4">
            {`Are you sure to remove ${userName} from ${departmentName}?`}
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{userName}</span>" to confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/departments/${id}`)}
            >
              Cancel
            </Button>
            <Button
              disabled={userName !== confirmText || submitting}
              variant="destructive"
              type="submit"
            >
              {submitting ? "Removing" : "Remove"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
