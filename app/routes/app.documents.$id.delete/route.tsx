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
  deleteUserDocumentById,
  getUserDocumentById,
} from "~/services/document.server";
import { requireUser } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const documentId = params.id;
  if (!documentId) {
    return redirect(`/app/documents`);
  }

  const loggedInUser = await requireUser(request);

  await deleteUserDocumentById({ documentId, userId: loggedInUser.id });

  return redirectWithToast(`/app/documents`, {
    description: `Document deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const documentId = params.id;
  if (!documentId) {
    return redirect(`/app/documents`);
  }

  const loggedInUser = await requireUser(request);

  const document = await getUserDocumentById({
    documentId,
    userId: loggedInUser.id,
    onlyIdAndTitle: true,
  });

  if (!document) {
    return redirect(`/app/documents`);
  }

  return json({ document });
}

export default function DeleteDocument() {
  const { document } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/documents/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Document
          </Heading>
          <p className="my-4">
            Are you sure to delete document "{document.title}"?
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{document.title}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/documents/${id}`)}
            >
              Cancel
            </Button>
            <Button
              disabled={document.title !== confirmText || submitting}
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
