import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  Modal,
  Dialog,
  Label,
  Button,
  Select,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Heading,
} from "react-aria-components";

import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { requireOrganizationUser } from "~/utils/auth.server";
import { ChevronDownIcon } from "lucide-react";
import { labelVariants } from "~/components/ui/label";
import { selectClassName } from "~/components/ui/select";
import {
  getUserDocumentById,
  getUserDocuments,
} from "~/services/document.server";
import { createTrackerAttachmentTypeLink } from "~/services/attachment.server";
import { emitter } from "~/utils/sse/emitter.server";

const schema = z.object({
  documentId: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const trackerId = params.id;
  const trackerItemId = params.itemId;
  if (!trackerId || !trackerItemId) {
    return redirect(`/app/${organizationId}/time-tracker`);
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { documentId } = submission.value;

  const document = await getUserDocumentById({
    documentId,
    organizationId,
    userId: loggedInUser.id,
  });
  if (!document) {
    return redirectWithToast(`/app/${organizationId}/time-tracker`, {
      description: `Document not found`,
      type: "success",
    });
  }

  await createTrackerAttachmentTypeLink({
    displayName: document?.title,
    organizationId,
    trackerItemId,
    url: `${process.env.APP_URL}/documents/${document.id}`,
    userId: loggedInUser.id,
    type: "DOCUMENT",
  });

  emitter.emit(`tracker-${loggedInUser.id}-changed`);

  return redirectWithToast(`/app/${organizationId}/time-tracker`, {
    description: `Document added`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const trackerId = params.id;
  if (!trackerId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  const documents = await getUserDocuments({
    organizationId,
    userId: loggedInUser.id,
    isPublished: true,
  });

  return json({ documents });
}

export default function ChangeProjectChampion() {
  const lastResult = useActionData<typeof action>();
  const { documents } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/time-tracker`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Add Document
          </Heading>
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <Select name="documentId">
                <Label className={labelVariants()}>Select Document</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue className="flex items-center gap-2" />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    {documents.map((document) => (
                      <ListBoxItem
                        key={document.id}
                        id={document.id}
                        value={{ id: document.id }}
                        className="px-1 py-1.5 text-sm font-semibold rounded flex gap-2 items-center cursor-pointer hover:bg-accent"
                      >
                        <span>{document.icon}</span>
                        <span>{document.title}</span>
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.documentId.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/${orgId}/time-tracker`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(buttonVariants())}
              isDisabled={submitting}
            >
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}
