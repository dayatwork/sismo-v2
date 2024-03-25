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
import { deleteJournal, getJournalById } from "~/services/journal.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const journalId = params.id;
  if (!journalId) {
    return redirect(`/app/journals`);
  }

  await requirePermission(request, "manage:finance");

  await deleteJournal({ journalId });

  return redirectWithToast(`/app/journals`, {
    description: `Journal deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const journalId = params.id;
  if (!journalId) {
    return redirect(`/app/journals`);
  }

  await requirePermission(request, "manage:finance");

  const journal = await getJournalById({
    journalId,
  });

  if (!journal) {
    return redirect(`/app/journals`);
  }

  return json({ journal });
}

export default function DeleteJournal() {
  const { journal } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/journals`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Journal
          </Heading>
          <p className="my-4">Are you sure to delete this entry?</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "
            <span className="font-semibold">{journal.referenceNumber}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/journals`)}
            >
              Cancel
            </Button>
            <Button
              disabled={journal.referenceNumber !== confirmText || submitting}
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
